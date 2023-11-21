import type {NextApiRequest, NextApiResponse} from 'next';
import {DomainActivity} from '@prisma/client';
import * as Sentry from '@sentry/node';
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

// TODO Limit response by time window

async function get({req, res}: AuthMethodContext) {
  const memberId = req.query?.memberId as string;

  const startTime = performance.now();
  try {
    // Find user
    const member = await prismadb.member.findUniqueOrThrow({
      where: {
        id: memberId,
      },
      include: {
        memberEvent: {
          orderBy: {
            date: 'desc',
            // TODO(Optimize): select count only
          },
        },
        settings: true,
      },
    });

    const memberResponse = unwrapSettings(member);

    // Find domain and session activities for that user just by user ID
    // TODO: Consider limiting this to last 7/30 days only
    // TODO: Request only today with all details and request summary for trends & average
    const activities = await prismadb.domainActivity.findMany({
      where: {
        member: {
          id: memberResponse.id,
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

    // Batch query for domain names
    const uniqueDomainIds = [...new Set(activities.map((activity) => activity.domainId))];
    const domainRecords = await prismadb.domain.findMany({
      where: {
        id: {
          in: uniqueDomainIds,
        },
      },
      select: {
        domain: true,
        id: true,
      },
    });

    const domainMap: {[id: string]: string} = {};
    domainRecords.forEach((record) => {
      domainMap[record.id] = record.domain;
    });

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

    logger.debug('Get member stats', {
      memberId: member.id,
      duration: performance.now() - startTime,
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
