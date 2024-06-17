import type {NextApiRequest, NextApiResponse} from 'next';
import {isToday, subDays} from 'date-fns';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext} from '../../../types/api';
import {endpointHandler} from '../../../utils/api/endpoint-handler';
import {unwrapSettings} from '../../../utils/api/unwrap-settings';
import {PerfMarks} from '../../../utils/perf';
import {logger} from '../../../lib/logger';
import {getDomainNamesByIds} from '../../../utils/api/get-domain-names';
import {getIsoDateString} from '../../../utils/get-iso-date-string';

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
            take: 7, // Only take the last record
            select: {
              date: true,
              activityTime: true,
              domainsCount: true,
              sessionCount: true,
              lastSessionEndDatetime: true,
            },
          },
          settings: true,
          domainActivity: {
            orderBy: [{date: 'desc'}, {timeSpent: 'desc'}],
            take: 1,
          },
        },
      },
    },
  });

  perf.mark('findTeams');

  let domainMap: {[id: string]: string} = {};
  if (response?.length) {
    const uniqueDomainIds = [
      ...new Set(
        response
          .map((team) => team.members.map((member) => member.domainActivity[0]?.domainId).flat())
          .flat()
          .filter((id) => id)
      ),
    ];
    domainMap = await getDomainNamesByIds(uniqueDomainIds);
  }
  perf.mark('domainNames');

  try {
    const result = response.map((team) => {
      const {id} = team;
      return {
        id,
        members: team.members.map((member) => {
          const memberWithSettings = unwrapSettings(member);
          const {summary: summaryArr, ...restMemberData} = memberWithSettings;
          const summary = summaryArr[0];

          const existingSummary7days = [...summaryArr]
            .map((s) => ({
              date: getIsoDateString(s.date),
              time: s.activityTime || 0,
            }))
            .reverse();

          let last7Days: Array<{date: string; time: number}> = [];
          if (existingSummary7days.length > 0 && existingSummary7days.length < 7) {
            const today = new Date();

            for (let i = 0; i < 7; i++) {
              const date = subDays(today, i);
              const dateStr = getIsoDateString(date);
              const existing = existingSummary7days.find((s) => s.date === dateStr);
              if (existing) {
                last7Days.unshift({
                  date: dateStr,
                  time: existing.time,
                });
              } else {
                last7Days.unshift({
                  date: dateStr,
                  time: 0,
                });
              }
            }
          } else {
            last7Days = [...existingSummary7days];
          }

          return {
            ...restMemberData,
            lastSummary: {
              isToday: summary?.lastSessionEndDatetime
                ? isToday(new Date(summary?.lastSessionEndDatetime))
                : false,
              topDomain: domainMap[member.domainActivity[0]?.domainId] || null,
              ...summary,
            },
            summary7days: last7Days,
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
