import type {NextApiRequest, NextApiResponse} from 'next';
import {isToday} from 'date-fns';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext} from '../../../types/api';
import {endpointHandler} from '../../../utils/api/endpoint-handler';
import {unwrapSettings} from '../../../utils/api/unwrap-settings';
import {PerfMarks} from '../../../utils/perf';
import {logger} from '../../../lib/logger';

async function get({res, session}: AuthMethodContext) {
  const perf = new PerfMarks();
  perf.start();

  const response = await prismadb.team.findMany({
    where: {
      ownerUserId: session.user.id,
    },
    include: {
      members: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          summary: {
            orderBy: {
              date: 'desc',
            },
            take: 1, // Only take the last record
            select: {
              activityTime: true,
              domainsCount: true,
              sessionCount: true,
              lastSessionEndDatetime: true,
            },
          },
          settings: true,
        },
      },
    },
  });

  perf.mark('findTeams');

  try {
    const result = response.map((team) => {
      const {id} = team;
      return {
        id,
        members: team.members.map((member) => {
          const memberWithSettings = unwrapSettings(member);
          const {summary: summaryArr, ...resetMemberData} = memberWithSettings;
          const summary = summaryArr[0];

          return {
            ...resetMemberData,
            lastSummary: {
              isToday: summary?.lastSessionEndDatetime
                ? isToday(new Date(summary?.lastSessionEndDatetime))
                : false,
              ...summary,
            },
          };
        }),
      };
    });

    perf.mark('mapResponse');

    res.json(result);

    logger.debug('Get Team View', {
      userId: session.user.id,
      totalTimeMs: performance.now() - perf.startTime,
      perfMarks: perf.getObjectLogs(),
    });
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
  }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return endpointHandler({req, res, handlers: {get}});
}
