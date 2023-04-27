import {getServerSession} from 'next-auth/next';
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Member, Team} from '@prisma/client';
import {authOptions} from '../auth/[...nextauth]';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext, SessionId} from '../../../types/api';
import {DEFAULT_TEAM_NAME} from '../../../const/team';

async function create({req, res, session}: AuthMethodContext) {
  const data: Member = req.body;

  try {
    const currentTeam = (await prismadb.team.findUniqueOrThrow({
      where: {ownerUserId_name: {ownerUserId: session.user.id, name: DEFAULT_TEAM_NAME}},
    })) as Team;

    const newMember = await prismadb.member.create({
      data: {
        ...data,
        teams: {connect: {id: currentTeam.id}},
      },
    });

    res.json(newMember);
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
    case 'POST':
      return create(context);
    default:
      return res.status(405).json(buildError('not allowed'));
  }
}
