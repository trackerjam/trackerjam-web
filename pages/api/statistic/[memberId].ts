import {getServerSession} from 'next-auth/next';
import type {NextApiRequest, NextApiResponse} from 'next';
import {DomainActivity} from '@prisma/client';
import * as Sentry from '@sentry/node';
import {authOptions} from '../../../app/api/auth/[...nextauth]/route';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {
  ActivitiesByDate,
  AuthMethodContext,
  MemberDataType,
  MemberStatisticActivityType,
  MemberStatisticType,
  SessionId,
} from '../../../types/api';
import {getIsoDateString} from '../../../utils/get-iso-date-string';
import {calculateIdleTime} from '../../../utils/api/calculate-idle';
import {classifyDomain} from '../../../utils/classification/classification';
import {getProductivityScore} from '../../../utils/classification/get-score';
import {unwrapSettings} from '../../../utils/api/unwrap-settings';

// TODO Limit response by time window

async function get({req, res}: AuthMethodContext) {
  const memberId = req.query?.memberId as string;

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
          },
        },
        settings: true,
      },
    });

    const memberResponse = unwrapSettings(member);

    // Find domain and session activities for that user just by user ID
    // TODO: Consider limiting this to last 7/30 days only
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
        sessionActivities: true,
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

      // TODO An option to include URL for Admin View
      const activityNoUrl = {
        ...activity,
        sessionActivities: activity.sessionActivities.map((sessionActivity) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const {url, ...rest} = sessionActivity;
          return rest;
        }),
      };

      // Get domains tags
      const domainsTags = classifyDomain(domainName);
      const score = getProductivityScore(domainsTags);

      return {
        ...activityNoUrl,
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

    res.json(result);
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
    throw e;
  }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions)) as SessionId;
  const {method} = req;

  if (!session?.user?.id) {
    return res.status(400).json(buildError('not auth'));
  }

  switch (method) {
    case 'GET':
      return get({req, res, session});
    default:
      return res.status(405).json(buildError('not allowed'));
  }
}
