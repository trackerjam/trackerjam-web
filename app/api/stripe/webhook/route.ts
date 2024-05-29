import Stripe from 'stripe';
import {NextRequest, NextResponse} from 'next/server';
import * as Sentry from '@sentry/nextjs';
import {buildError} from '../../../../utils/build-error';
import {logger} from '../../../../lib/logger';
import prismadb from '../../../../lib/prismadb';
import {PerfMarks} from '../../../../utils/perf';

// Good Docs:
// https://makerkit.dev/blog/tutorials/guide-nextjs-stripe
// https://github.com/Marc-Lou-Org/ship-fast-ts/blob/main/libs/stripe.ts

const StripeEvent = {
  CheckoutSessionCompleted: 'checkout.session.completed',
  CustomerSubscriptionDeleted: 'customer.subscription.deleted',
  CustomerSubscriptionUpdated: 'customer.subscription.updated',
  InvoicePaid: 'invoice.paid',
} as const;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  typescript: true,
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  const data = await req.text(); // Extract raw object to validate signature and parse by Stripe

  const perf = new PerfMarks();
  perf.start();

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    logger.error('No Stripe signature');
    return NextResponse.json(buildError('No signature'), {status: 400});
  }

  let event;
  try {
    // Verify the event by checking the signature using the Stripe library
    event = stripe.webhooks.constructEvent(data, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err: any) {
    logger.error('Webhook signature verification failed.', {error: err.message});
    return NextResponse.json(buildError('Webhook signature verification failed.'), {status: 500});
  }

  perf.mark('parseStripeEvent');

  let isProcessed: boolean = false;
  let result: boolean | Error = false;

  switch (event.type) {
    case StripeEvent.CheckoutSessionCompleted:
      result = await handleSessionCompleted(event.data.object);
      isProcessed = true;
      break;
    case StripeEvent.CustomerSubscriptionUpdated:
      result = await handleUpdated(event.data.object);
      isProcessed = true;
      break;
    case StripeEvent.InvoicePaid:
      result = await handleInvoicePaid(event.data.object);
      isProcessed = true;
      break;
    case StripeEvent.CustomerSubscriptionDeleted:
      result = await handleDeletion(event.data.object);
      isProcessed = true;
      break;
    default:
  }

  perf.mark('processStripeEvent');

  logger.debug('Stripe Webhook', {
    totalTimeMs: performance.now() - perf.startTime,
    perfMarks: perf.getObjectLogs(),
  });

  if (isProcessed && (!result || result instanceof Error)) {
    const errorMsg = result instanceof Error ? result.message : 'false';
    logger.error('Webhook processing error', {error: errorMsg});
    Sentry.captureException(errorMsg);
    return NextResponse.json(buildError('Webhook processing error'), {status: 500});
  }

  return NextResponse.json({}, {status: 200});
}

async function handleSessionCompleted(eventData: Stripe.Checkout.Session) {
  try {
    const session = await stripe.checkout.sessions.retrieve(eventData.id, {
      expand: ['line_items'],
    });

    if (!session) {
      return new Error('[Checkout Session]: Session not found');
    }

    const userId = session.client_reference_id as string;
    const email = session.customer_email || session.customer_details?.email;

    if (!email && !userId) {
      return new Error('[Checkout Session]: No user data');
    }

    let userRecords;
    if (userId) {
      userRecords = await prismadb.user.findUnique({
        where: {
          id: userId,
        },
      });
    } else if (email) {
      userRecords = await prismadb.user.findUnique({
        where: {
          email,
        },
      });
    }
    if (!userRecords?.id) {
      return new Error('[Checkout Session]: User not found');
    }

    // Update payment status
    const paymentRecord = await prismadb.payment.upsert({
      where: {
        userId: userRecords.id,
      },
      create: {
        userId: userRecords.id,
        status: 'ACTIVE',
        product: session.line_items?.data[0]?.price?.product as string,
        customerId: session?.customer as string,
      },
      update: {
        status: 'ACTIVE',
        product: session.line_items?.data[0]?.price?.product as string,
      },
    });

    if (!paymentRecord) {
      return new Error('[Checkout Session]: Payment not updated');
    }
  } catch (e: any) {
    logger.error('Invoice payment processing error', {error: e.message});
    return new Error('Checkout Payment processing error');
  }

  return true;
}

async function handleInvoicePaid(eventData: Stripe.Invoice) {
  try {
    if (!eventData.customer) {
      logger.error('[Invoice]: No customer id');
      // Ignore silently
      return true;
    }

    const paymentRecord = await prismadb.payment.findFirst({
      where: {
        customerId: eventData.customer as string,
      },
    });
    if (!paymentRecord) {
      // Product record might not be created yet
      logger.warn('[Invoice]: Payment record not found', {customerId: eventData.customer});
      // Ignore silently
      return true;
    }

    // Update status if the product is in the list
    if (paymentRecord?.product === (eventData.lines?.data?.[0]?.price?.id as string)) {
      await prismadb.payment.update({
        where: {
          id: paymentRecord.id,
        },
        data: {
          status: 'ACTIVE',
        },
      });
    } else {
      logger.error('[Invoice]: Product is not the same');
    }

    return true;
  } catch (e: any) {
    logger.error('Invoice payment processing error', {error: e.message});
    return new Error('Invoice payment processing error');
  }
}

async function handleUpdated(eventData: Stripe.Subscription) {
  try {
    const customerId = eventData.customer;

    if (!customerId) {
      logger.error('[Updated]: No customer id');
      // Ignore silently
      return true;
    }

    await prismadb.payment.update({
      where: {
        customerId: customerId as string,
      },
      data: {
        paidUntil: eventData.current_period_end
          ? new Date(eventData.current_period_end * 1000) // Convert seconds to milliseconds
          : null,
      },
    });

    return true;
  } catch (e: any) {
    logger.error('Update payment processing error', {error: e.message});
    return new Error('Update payment processing error');
  }
}

async function handleDeletion(eventData: Stripe.Subscription) {
  try {
    const customerId = eventData.customer;

    if (!customerId) {
      logger.error('[Deletion]: No customer id');
      // Ignore silently
      return true;
    }

    await prismadb.payment.update({
      where: {
        customerId: customerId as string,
      },
      data: {
        status: 'CANCELLED',
        paidUntil: eventData.current_period_end
          ? new Date(eventData.current_period_end * 1000) // Convert seconds to milliseconds
          : null,
      },
    });

    return true;
  } catch (e: any) {
    logger.error('Deletion payment processing error', {error: e.message});
    return new Error('Deletion payment processing error');
  }
}
