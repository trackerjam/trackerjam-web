import type {NextApiRequest, NextApiResponse} from 'next';
import {Member} from '@prisma/client';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext} from '../../../types/api';
import {endpointHandler} from '../../../utils/api/endpoint-handler';
import {unwrapSettings} from '../../../utils/api/unwrap-settings';

async function get({res, session}: AuthMethodContext) {
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

  try {
    const result = response.map((team) => {
      return {
        ...team,
        members: team.members.map((member) => unwrapSettings(member as Member)),
      };
    });

    res.json(result);
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
  }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return endpointHandler({req, res, handlers: {get}});
}
