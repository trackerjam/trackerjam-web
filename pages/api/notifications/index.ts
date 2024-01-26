import type {NextApiRequest, NextApiResponse} from 'next';
import * as Sentry from '@sentry/nextjs';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext} from '../../../types/api';
import {endpointHandler} from '../../../utils/api/endpoint-handler';

async function get({res, session}: AuthMethodContext) {
  const id = session.user.id;

  try {
    const notification = await prismadb.notification.findUnique({
      where: {
        userId: id,
      },
      select: {
        welcome: true,
      },
    });

    return res.status(200).json(notification ?? {});
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
    Sentry.captureException(e);
    console.error(e);
  }
}
async function set({res, req, session}: AuthMethodContext) {
  const id = session.user.id;
  const {name}: {name: 'welcome' | undefined} = req.body;

  if (!name) {
    return res.status(400).json(buildError('bad params'));
  }

  try {
    await prismadb.notification.upsert({
      where: {
        userId: id,
      },
      update: {
        [name]: new Date(),
      },
      create: {
        [name]: new Date(),
        userId: id,
      },
    });

    return res.status(200).end();
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
    Sentry.captureException(e);
    console.error(e);
  }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return endpointHandler({req, res, handlers: {put: set, get}});
}
