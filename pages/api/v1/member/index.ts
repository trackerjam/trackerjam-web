import type {NextApiRequest, NextApiResponse} from 'next';
import type {Member, STATUS} from '@prisma/client';
import prismadb from '../../../../lib/prismadb';
import {getErrorMessage} from '../../../../utils/get-error-message';
import {buildError} from '../../../../utils/build-error';
import {PublicMethodContext} from '../../../../types/api';

type UpdateParams = {
  token: string;
  status: STATUS;
};

type GetParams = {
  token: string;
};

const ALLOWED_STATUS_UPDATE: Array<STATUS> = ['ACTIVE', 'PAUSED'];

async function update({req, res}: PublicMethodContext) {
  const {token, status}: UpdateParams = req.body;

  if (!token || !status || !ALLOWED_STATUS_UPDATE.includes(status)) {
    return res.status(400).json(buildError('bad params'));
  }

  try {
    const member = (await prismadb.member.findUniqueOrThrow({
      where: {token},
    })) as Member;

    await prismadb.member.update({
      where: {
        id: member.id,
      },
      data: {
        status,
      },
    });

    return res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).json(buildError(getErrorMessage(e)));
  }
}

async function get({req, res}: PublicMethodContext) {
  const {token} = req.query as GetParams;

  if (!token) {
    return res.status(400).json(buildError('bad params'));
  }

  try {
    const member = (await prismadb.member.findUniqueOrThrow({
      where: {token},
    })) as Member;

    const settings = await prismadb.memberSettings.findUnique({
      where: {
        memberId: member.id,
      },
    });

    if (!settings) {
      console.log(`MemberSettings not found, memberId: ${member.id}`);
    }

    return res.status(200).json(settings ?? {});
  } catch (e) {
    console.error(e);
    res.status(500).json(buildError(getErrorMessage(e)));
  }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const {method} = req;
  const context: PublicMethodContext = {req, res};

  switch (method) {
    case 'GET':
      // Get member settings
      return get(context);
    case 'PUT':
      // Activate member token
      return update(context);
    default:
      return res.status(405).json(buildError('not allowed'));
  }
}
