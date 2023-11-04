import type {NextApiRequest, NextApiResponse} from 'next';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext, GetTeamResponse} from '../../../types/api';
import {endpointHandler} from '../../../utils/api/endpoint-handler';

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
            select: {
              activityTime: true,
              domainsCount: true,
              sessionCount: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  try {
    const result: GetTeamResponse = response;
    res.json(result);
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
  }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return endpointHandler({req, res, handlers: {get}});
}
