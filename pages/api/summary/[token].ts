import type {NextApiRequest, NextApiResponse} from 'next';
import * as Sentry from '@sentry/nextjs';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext, SummaryResponse} from '../../../types/api';
import {endpointHandler} from '../../../utils/api/handler';

async function get({req, res}: AuthMethodContext) {
  const {token} = req.query as {token: string};

  if (!token) {
    return res.status(400).json(buildError('bad params'));
  }

  try {
    const summary = await prismadb.summary.findUnique({
      where: {
        date_memberToken: {
          date: new Date(),
          memberToken: token,
        },
      },
    });

    const {activityTime, domainsCount, sessionCount} = summary || {};
    const response: SummaryResponse = summary
      ? {
          activityTime,
          domainsCount,
          sessionCount,
        }
      : {};

    res.json(response);
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
    Sentry.captureException(e);
    console.error(e);
  }
}

// TODO Do not allow to see other users' data in Prod, but allow in Dev
export default async function (req: NextApiRequest, res: NextApiResponse) {
  return endpointHandler({req, res, handlers: {get}});
}
