import {getServerSession} from 'next-auth/next';
import type {NextApiRequest, NextApiResponse} from 'next';
import {authOptions} from '../auth/[...nextauth]';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {GetTeamResponse, SessionId} from '../../../types/api';

// TODO Limit response by time window

async function get(res: NextApiResponse, session: SessionId) {
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
  const session = (await getServerSession(req, res, authOptions)) as SessionId;
  const {method} = req;

  if (!session?.user?.id) {
    return res.status(400).json(buildError('not auth'));
  }

  switch (method) {
    case 'GET':
      return get(res, session);
    default:
      return res.status(405).json(buildError('not allowed'));
  }
}
