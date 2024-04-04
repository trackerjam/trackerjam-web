import type {NextApiRequest, NextApiResponse} from 'next';
import * as Sentry from '@sentry/nextjs';
import {PaymentStatus} from '@prisma/client';
import {format} from 'date-fns';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext, SubscriptionStatusResponse} from '../../../types/api';
import {endpointHandler} from '../../../utils/api/endpoint-handler';
import {PRODUCT_LIMITS} from '../../../const/payment';
import {calcTrialEnd} from '../../../utils/api/calc-trial-end';

// Get user subscription status
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatusResponse> {
  // Check user payment status
  const payment = await prismadb.payment.findUnique({
    where: {
      userId,
    },
  });

  const hasActiveSubscription = payment?.status === PaymentStatus.ACTIVE;

  if (!hasActiveSubscription) {
    // Check user creation date
    const user = await prismadb.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        createdAt: true,
      },
    });

    if (!user?.createdAt) {
      throw new Error('User createdAt not found');
    }

    const now = new Date();
    const trialEndsAt = calcTrialEnd(user.createdAt);
    const hasTrial = now < trialEndsAt;

    if (hasTrial) {
      // Early return in case of trial
      return {
        status: PaymentStatus.ACTIVE,
        canAddMember: true,
        hasTrial: true,
        trialEndsAt: format(trialEndsAt, 'dd MMM yyyy'),
      };
    }

    // Early return in case of not active status
    return {
      status: payment?.status ?? PaymentStatus.FREE,
      canAddMember: false,
      hasTrial: false,
    };
  }

  // Count member and check limit
  const userMembersCount = await prismadb.member.aggregate({
    _count: true,
    where: {
      mangerId: userId,
    },
  });

  if (typeof userMembersCount?._count === 'undefined') {
    throw new Error('Member count not found');
  }

  const productId = payment.product;

  if (!productId) {
    throw new Error('Product not found');
  }
  const limit = PRODUCT_LIMITS[productId] ?? 0;
  const canAddMember = userMembersCount._count < limit;

  return {
    status: payment.status,
    hasTrial: false,
    canAddMember,
  };
}

async function get({res, session}: AuthMethodContext) {
  const userId = session.user.id;

  try {
    const response = await getSubscriptionStatus(userId);

    res.json(response as SubscriptionStatusResponse);
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
    Sentry.captureException(e);
    console.error(e);
  }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return endpointHandler({req, res, handlers: {get}});
}
