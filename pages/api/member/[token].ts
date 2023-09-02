import * as Sentry from '@sentry/nextjs';
import {getServerSession} from 'next-auth/next';
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Team} from '@prisma/client';
import {authOptions} from '../../../app/api/auth/[...nextauth]/route';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext, SessionId} from '../../../types/api';
import {DEFAULT_TEAM_NAME} from '../../../const/team';
import {EditMemberDataType} from '../../../types/member';
import {sendTokenMail} from '../../../utils/api/send-mail';

async function create({req, res, session}: AuthMethodContext) {
  const data: EditMemberDataType = req.body;
  const managerId = session.user.id;

  try {
    const currentTeam = (await prismadb.team.findUniqueOrThrow({
      where: {ownerUserId_name: {ownerUserId: session.user.id, name: DEFAULT_TEAM_NAME}},
    })) as Team;

    const {name, email, title, settings} = data;
    const newMemberData = {
      name,
      email,
      title,
    };

    const newMember = await prismadb.member.create({
      data: {
        ...newMemberData,
        teams: {connect: {id: currentTeam.id}},
        mangerId: managerId,
        settings: {
          create: {
            settings: settings ?? {},
          },
        },
      },
    });

    res.status(200).json(newMember); // early return

    // Send token to the new member
    if (typeof newMember.email === 'string' && newMember.email) {
      await sendTokenMail(newMember.email as string, newMember.token);
    }
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
    Sentry.captureException(e);
    console.error(e);
  }
}

async function deleteMember({req, res, session}: AuthMethodContext) {
  const token = req.query?.token as string;
  const managerId = session.user.id;

  if (!token) {
    return res.status(400).json(buildError('bad params'));
  }

  try {
    // Check ownership
    await prismadb.member.findFirstOrThrow({
      where: {
        mangerId: managerId,
        token,
      },
    });

    await prismadb.member.delete({
      where: {
        token,
      },
    });

    res.status(200).end();
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
    Sentry.captureException(e);
    console.error(e);
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
    case 'DELETE':
      return deleteMember(context);
    default:
      return res.status(405).json(buildError('not allowed'));
  }
}
