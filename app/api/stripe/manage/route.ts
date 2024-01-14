import Stripe from 'stripe';
import {NextResponse} from 'next/server';
import {getServerSession} from 'next-auth/next';
import {buildError} from '../../../../utils/build-error';
import {logger} from '../../../../lib/logger';
import {authOptions} from '../../auth/[...nextauth]/route';
import {SessionId} from '../../../../types/api';
import prismadb from '../../../../lib/prismadb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  typescript: true,
});

const RETURN_URL = process.env.NEXTAUTH_URL + '/settings';

export async function POST() {
  try {
    const session = (await getServerSession(authOptions)) as SessionId;

    if (!session?.user?.id) {
      return NextResponse.json(buildError('not auth'), {status: 400});
    }

    const user = await prismadb.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
      include: {
        payment: true,
      },
    });

    if (!user?.payment?.customerId) {
      logger.error('User has no Stripe customer ID', {user});
      return NextResponse.json(buildError('server error'), {status: 500});
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.payment.customerId,
      return_url: RETURN_URL,
    });

    return NextResponse.json({url: portalSession.url});
  } catch (e: any) {
    logger.error('Error creating Stripe portal', {error: e.message});
    return NextResponse.json(buildError('server error'), {status: 500});
  }
}
