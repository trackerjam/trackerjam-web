import type {NextApiRequest, NextApiResponse} from 'next';
import * as Sentry from '@sentry/nextjs';
import {maskEmail2} from 'maskdata';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext} from '../../../types/api';
import {endpointHandler} from '../../../utils/api/endpoint-handler';
import {checkAdminAccess} from '../../../utils/check-admin-access';
import {PerfMarks} from '../../../utils/perf';
import {logger} from '../../../lib/logger';

async function get({res, session}: AuthMethodContext) {
  const perf = new PerfMarks();
  perf.start();

  try {
    const users = await prismadb.user.findMany({
      orderBy: {
        emailVerified: 'desc',
      },
      include: {
        _count: {
          select: {
            member: true,
          },
        },
      },
    });

    const responseUsers = users.map((user) => {
      return {
        ...user,
        email: maskEmail2(user?.email ?? '', {
          maskWith: '*',
          unmaskedStartCharactersBeforeAt: 3,
          unmaskedEndCharactersAfterAt: 4,
          maskAtTheRate: false,
        }),
      };
    });

    perf.mark('findUsers');
    logger.debug('Get Superadmin View', {
      userId: session.user.id,
      totalTimeMs: performance.now() - perf.startTime,
      perfMarks: perf.getObjectLogs(),
    });

    res.json({users: responseUsers});
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
    checkPermission: async ({session}) => {
      const {user} = session;
      return checkAdminAccess(user?.id);
    },
  });
}
