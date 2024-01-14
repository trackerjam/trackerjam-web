import Stripe from 'stripe';
import {NextRequest, NextResponse} from 'next/server';
import {getServerSession} from 'next-auth/next';
import {buildError} from '../../../../utils/build-error';
import {logger} from '../../../../lib/logger';
import {authOptions} from '../../auth/[...nextauth]/route';
import {SessionId} from '../../../../types/api';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  typescript: true,
});

const SUCCESS_URL = process.env.NEXTAUTH_URL + '/settings?success=true';
const CANCEL_URL = process.env.NEXTAUTH_URL + '/settings?success=false';

export async function POST(req: NextRequest) {
  const {priceId} = await req.json();
  if (!priceId) {
    return NextResponse.json(buildError('bad params'), {status: 400});
  }

  try {
    const session = (await getServerSession(authOptions)) as SessionId;

    if (!session?.user?.id) {
      return NextResponse.json(buildError('not auth'), {status: 400});
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
      customer_email: session?.user?.email,
      client_reference_id: session?.user?.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
    });

    if (!stripeSession?.url) {
      logger.error('Can not create Stripe session', {session: stripeSession});
      return NextResponse.json(buildError('server error'), {status: 500});
    }

    return NextResponse.json({url: stripeSession.url});
  } catch (e: any) {
    logger.error('Error creating Stripe session', {error: e.message});
    return NextResponse.json(buildError('server error'), {status: 500});
  }
}
