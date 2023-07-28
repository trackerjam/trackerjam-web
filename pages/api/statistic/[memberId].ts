import {getServerSession} from 'next-auth/next';
import type {NextApiRequest, NextApiResponse} from 'next';
import {DomainActivity} from '@prisma/client';
import {authOptions} from '../auth/[...nextauth]';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext, SessionId} from '../../../types/api';
import {getIsoDateString} from '../../../utils/get-iso-date-string';

// TODO Limit response by time window

async function get({req, res}: AuthMethodContext) {
  const memberId = req.query?.memberId as string;

  try {
    // Find user
    const member = await prismadb.member.findUniqueOrThrow({
      where: {
        id: memberId,
      },
    });

    // Find domain and session activities for that user just by user ID
    // TODO: Consider limiting this to last 7/30 days only
    const activities = await prismadb.domainActivity.findMany({
      where: {
        member: {
          id: member.id,
        },
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        sessionActivities: true,
      },
    });

    // Extend activities with the real domain name
    const extendedActivities = [];
    for (let i = 0; i < activities.length; i++) {
      const domain = await prismadb.domain.findUnique({
        where: {
          id: activities[i].domainId,
        },
      });

      const extendedActivity = {
        ...activities[i],
        domainName: domain?.domain || 'unknown',
      };

      extendedActivities.push(extendedActivity);

      if (!domain?.domain) {
        console.error(`Domain for id "${activities[i].domainId}" not found`);
        // TODO Consider throw Sentry error
      }
    }

    // Group activities by date, without specific time
    const activitiesByDate = extendedActivities.reduce((mem, act) => {
      const isoDate = getIsoDateString(act.date);
      if (!mem[isoDate]) {
        mem[isoDate] = [];
      }
      mem[isoDate].push(act);
      return mem;
    }, {} as {[date: string]: Array<DomainActivity>});

    const result = {
      member,
      activities: activitiesByDate,
    };

    res.json(result);
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
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
