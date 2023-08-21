import {getServerSession} from 'next-auth/next';
import type {NextApiRequest, NextApiResponse} from 'next';
import {authOptions} from '../../../app/api/auth/[...nextauth]/route';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext, DashboardResponse, SessionId} from '../../../types/api';
import {DEFAULT_TEAM_NAME} from '../../../const/team';

async function get({res, session}: AuthMethodContext) {
  try {
    const currentTeam = (await prismadb.team.findUniqueOrThrow({
      where: {ownerUserId_name: {ownerUserId: session.user.id, name: DEFAULT_TEAM_NAME}},
      select: {
        _count: {
          select: {members: true},
        },
      },
    })) as {_count: {members: number}};

    const response: DashboardResponse = {
      membersCount: currentTeam?._count?.members,
    };

    res.json(response);
  } catch (e) {
    console.error(e);
    res.status(500).json(buildError(getErrorMessage(e)));
  }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions)) as SessionId;
  const {method} = req;

  if (!session?.user?.id) {
    return res.status(400).json(buildError('not auth'));
  }

  const context: AuthMethodContext = {req, res, session};

  switch (method) {
    case 'GET':
      return get(context);
    default:
      return res.status(405).json(buildError('not allowed'));
  }
}
