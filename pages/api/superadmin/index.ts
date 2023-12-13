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
import {classifyDomain, isKnownDomain} from '../../../utils/classification/classification';

async function get({res, session}: AuthMethodContext) {
  const perf = new PerfMarks();
  perf.start();

  try {
    const users = await prismadb.user.findMany({
      orderBy: {
        emailVerified: 'desc',
      },
      include: {
        member: {
          select: {
            _count: true,
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

    const allDomains = await prismadb.domain.findMany();
    const domainCounts = allDomains.reduce(
      (acc, {domain}) => {
        const domainTags = classifyDomain(domain);
        const isKnown = isKnownDomain(domain);

        let type = 'classified';
        if (!isKnown) {
          type = 'unknown';
        } else if (domainTags.Other === 1 || domainTags.Unknown === 1) {
          type = 'unclassified';
        }

        if (!acc[type]) {
          acc[type] = 0;
        }
        acc[type] += 1;

        return acc;
      },
      {} as {[key: string]: number}
    );
    domainCounts.total = allDomains.length;
    perf.mark('countDomains');

    logger.debug('Get Superadmin View', {
      userId: session.user.id,
      totalTimeMs: performance.now() - perf.startTime,
      perfMarks: perf.getObjectLogs(),
    });

    res.json({users: responseUsers, domains: domainCounts});
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
