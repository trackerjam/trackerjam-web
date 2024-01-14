import type {NextApiRequest, NextApiResponse} from 'next';
import * as Sentry from '@sentry/nextjs';
import {PaymentStatus} from '@prisma/client';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext, SettingsResponse} from '../../../types/api';
import {endpointHandler} from '../../../utils/api/endpoint-handler';

async function get({res, session}: AuthMethodContext) {
  const {id} = session.user;

  try {
    const paymentRecord = await prismadb.payment.findUnique({
      where: {
        userId: id,
      },
    });

    const hasSub = paymentRecord?.status === PaymentStatus.ACTIVE;
    const response: SettingsResponse = {
      hasSubscription: hasSub,
    };

    res.json(response);
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
    Sentry.captureException(e);
    console.error(e);
  }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return endpointHandler({
    req,
    res,
    handlers: {get},
  });
}
