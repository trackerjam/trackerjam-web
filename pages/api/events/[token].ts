import type {NextApiRequest, NextApiResponse} from 'next';
import * as Sentry from '@sentry/nextjs';
import {MemberEvent} from '.prisma/client';
import {subDays} from 'date-fns';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext} from '../../../types/api';
import {endpointHandler} from '../../../utils/api/endpoint-handler';
import {PerfMarks} from '../../../utils/perf';
import {logger} from '../../../lib/logger';

async function get({req, res}: AuthMethodContext) {
  const {token} = req.query as {token: string};

  if (!token) {
    return res.status(400).json(buildError('bad params'));
  }

  const perf = new PerfMarks();
  perf.start();

  try {
    const memberEvents = await prismadb.memberEvent.findMany({
      where: {
        memberToken: token,
        date: {
          gte: subDays(new Date(), 30),
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    const response: MemberEvent[] = memberEvents || [];

    perf.mark('findMemberEvents');

    logger.debug('Get Member Events', {
      token,
      totalTimeMs: performance.now() - perf.startTime,
      perfMarks: perf.getObjectLogs(),
    });

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
    checkPermission: async ({req, session}) => {
      const token = req.query?.token as string;

      const requestedMember = await prismadb.member.findUnique({
        where: {
          token,
        },
      });

      return Boolean(requestedMember && requestedMember.mangerId === session.user.id);
    },
  });
}
