import * as Sentry from '@sentry/nextjs';
import {getServerSession} from 'next-auth/next';
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Member, Team} from '@prisma/client';
import {authOptions} from '../../../app/api/auth/[...nextauth]/route';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext, PublicMethodContext, SessionId} from '../../../types/api';
import {DEFAULT_TEAM_NAME} from '../../../const/team';
import {CreateMemberDataType, EditMemberDataType} from '../../../types/member';
import {sendTokenMail} from '../../../utils/api/send-mail';
import {unwrapSettings} from '../../../utils/api/unwrap-settings';

async function get({req, res}: AuthMethodContext) {
  const id = req.query?.token as string;

  const member = await prismadb.member.findUnique({
    where: {
      id,
    },
    include: {
      settings: true,
    },
  });

  try {
    const memberResponse = unwrapSettings(member as Member);
    res.json(memberResponse);
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
  }
}

async function create({req, res, session}: AuthMethodContext) {
  const data: CreateMemberDataType = req.body;
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
    try {
      if (typeof newMember.email === 'string' && newMember.email) {
        await sendTokenMail(newMember.email as string, newMember.token);
      }
    } catch (e) {
      // Do not throw error if email sending failed, just log it
      // We also can't update the response anymore, because it was already sent
      Sentry.captureException(e);
      console.error(e);
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

const ALLOWED_MEMBER_FIELDS = ['name', 'email', 'title', 'settings'];
async function update({req, res}: PublicMethodContext) {
  const {token, ...memberFields}: EditMemberDataType = req.body;
  const fieldKeys = Object.keys(memberFields);
  if (!token || fieldKeys.length === 0) {
    return res.status(400).json(buildError('bad params'));
  }

  const updateData = fieldKeys.reduce((acc, key) => {
    if (ALLOWED_MEMBER_FIELDS.includes(key)) {
      acc[key as keyof EditMemberDataType] = memberFields[key as keyof EditMemberDataType];
    }
    return acc;
  }, {} as Partial<EditMemberDataType>);

  try {
    const member = await prismadb.member.findUnique({
      where: {
        token,
      },
      include: {
        settings: true,
      },
    });

    if (!member) {
      return res.status(204).json(buildError('user not found'));
    }

    const updatedMember = await prismadb.member.update({
      where: {
        id: member.id,
      },
      data: {
        ...updateData,
        settings: {
          update: {
            settings: {
              ...member.settings,
              ...(updateData?.settings || {}),
            },
          },
        },
      },
    });

    return res.status(200).json(updatedMember);
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
    Sentry.captureException(e);
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
    case 'POST':
      return create(context);
    case 'PUT':
      return update(context);
    case 'DELETE':
      return deleteMember(context);
    default:
      return res.status(405).json(buildError('not allowed'));
  }
}
