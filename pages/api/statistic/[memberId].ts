import type {NextApiRequest, NextApiResponse} from 'next';
import {DomainActivity} from '@prisma/client';
import * as Sentry from '@sentry/node';
import {subDays} from 'date-fns';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {
  ActivitiesByDate,
  AuthMethodContext,
  MemberDataType,
  MemberStatisticActivityType,
  MemberStatisticType,
} from '../../../types/api';
import {getIsoDateString} from '../../../utils/get-iso-date-string';
import {calculateIdleTime} from '../../../utils/api/calculate-idle';
import {classifyDomain} from '../../../utils/classification/classification';
import {getProductivityScore} from '../../../utils/classification/get-score';
import {unwrapSettings} from '../../../utils/api/unwrap-settings';
import {endpointHandler} from '../../../utils/api/endpoint-handler';
import {logger} from '../../../lib/logger';
import {PerfMarks} from '../../../utils/perf';
import {getDomainNamesByIds} from '../../../utils/api/get-domain-names';

const MAX_LIMIT = 30;

async function get({req, res}: AuthMethodContext) {
  const memberId = req.query?.memberId as string;
  let limit = Number(req.query?.limit) ?? MAX_LIMIT;
  if (!limit || limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  const perf = new PerfMarks();
  perf.start();

  try {
    // Find user
    const member = await prismadb.member.findUniqueOrThrow({
      where: {
        id: memberId,
      },
      include: {
        settings: true,
      },
    });
    perf.mark('findMember');

    const memberResponse = unwrapSettings(member);

    const today = new Date();
    const limitToDate = subDays(today, limit);

    // Find domain and session activities for that user just by user ID
    // TODO: Request only today with all details and request summary for trends & average
    const activities = await prismadb.domainActivity.findMany({
      where: {
        member: {
          id: memberResponse.id,
        },
        date: {
          gte: limitToDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        sessionActivities: {
          select: {
            id: true,
            startDatetime: true,
            endDatetime: true,
            title: true,
            isHTTPS: true,
          },
        },
      },
    });
    perf.mark('getDomainActivities');

    // Batch query for domain names
    const uniqueDomainIds = [...new Set(activities.map((activity) => activity.domainId))];
    const domainMap = await getDomainNamesByIds(uniqueDomainIds);
    perf.mark('getDomains');

    // Extend activities with the real domain name
    const extendedActivities = activities.map((activity) => {
      const domainName = domainMap[activity.domainId] || 'unknown';
      if (domainName === 'unknown') {
        const error = `Domain for id "${activity.domainId}" not found`;
        console.error(error);
        Sentry.captureException(error);
      }

      // Get domains tags
      const domainsTags = classifyDomain(domainName);
      const score = getProductivityScore(domainsTags);

      return {
        ...activity,
        domainName,
        domainsTags,
        productivityScore: score,
      };
    });

    // Group activities by date, without specific time
    const activitiesByDate = extendedActivities.reduce(
      (mem, act) => {
        const isoDate = getIsoDateString(act.date);
        if (!mem[isoDate]) {
          mem[isoDate] = [];
        }
        mem[isoDate].push(act);
        return mem;
      },
      {} as {[date: string]: Array<DomainActivity>}
    );

    const resultActivities = Object.entries(activitiesByDate).reduce((acc, item) => {
      const [dateStr, activities] = item as [string, MemberStatisticActivityType[]];
      const {totalActivityTime, idleTime} = calculateIdleTime(activities);
      acc[dateStr] = {
        activities,
        totalActivityTime,
        idleTime,
      };
      return acc;
    }, {} as ActivitiesByDate);

    const result: MemberStatisticType = {
      member: memberResponse as MemberDataType,
      activitiesByDate: resultActivities,
    };

    perf.mark('processDomainData');

    logger.debug('Get Member Stats', {
      memberId: member.id,
      totalTimeMs: performance.now() - perf.startTime,
      perfMarks: perf.getObjectLogs(),
    });

    return res.json(result);
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
    throw e;
  }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return endpointHandler({
    req,
    res,
    handlers: {
      get,
    },
    checkPermission: async ({req, session}) => {
      const memberId = req.query?.memberId as string;
      const requestedMember = await prismadb.member.findUnique({
        where: {
          id: memberId,
        },
      });

      return Boolean(requestedMember && requestedMember.mangerId === session.user.id);
    },
  });
}

export const config = {
  api: {
    responseLimit: false,
  },
};
