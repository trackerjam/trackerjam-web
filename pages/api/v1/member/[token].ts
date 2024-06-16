import type {NextApiRequest, NextApiResponse} from 'next';
import type {Member, STATUS} from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
import prismadb from '../../../../lib/prismadb';
import {getErrorMessage} from '../../../../utils/get-error-message';
import {buildError} from '../../../../utils/build-error';
import {PublicMethodContext} from '../../../../types/api';
import {getSubscriptionStatus} from '../../subs';

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
    const member = (await prismadb.member.findUnique({
      where: {token},
    })) as Member;

    if (!member) {
      return res.status(204).json(buildError('user not found'));
    }

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
    res.status(500).json(buildError(getErrorMessage(e)));
    Sentry.captureException(e);
  }
}

async function get({req, res}: PublicMethodContext) {
  const {token} = req.query as GetParams;

  if (!token) {
    return res.status(400).json(buildError('bad params'));
  }

  try {
    const member = (await prismadb.member.findUnique({
      where: {token},
    })) as Member;

    if (!member) {
      return res.status(204).json(buildError('user not found'));
    }

    const settingsRecord = await prismadb.memberSettings.findUnique({
      where: {
        memberId: member.id,
      },
    });

    const subsStatusObject = await getSubscriptionStatus(member.mangerId);

    if (!settingsRecord?.settings) {
      const msg = `MemberSettings not found, memberId: ${member.id}`;
      console.error(msg);
      Sentry.captureMessage(msg);
    }

    const settings = settingsRecord?.settings ?? {};
    return res.status(200).json({
      token,
      settings,
      subscriptionStatus: subsStatusObject?.status,
      hasTrial: subsStatusObject?.hasTrial,
      canAddMember: subsStatusObject?.canAddMember,
      trialEndsAt: subsStatusObject?.trialEndsAt,
    });
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
    console.error(e);
    Sentry.captureException(e);
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
