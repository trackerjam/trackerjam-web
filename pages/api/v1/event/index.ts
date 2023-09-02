import type {NextApiRequest, NextApiResponse} from 'next';
import * as Sentry from '@sentry/nextjs';
import requestIp from 'request-ip';
import {buildError} from '../../../../utils/build-error';
import {CreateMemberEventInput, PublicMethodContext} from '../../../../types/api';
import prismadb from '../../../../lib/prismadb';
import {getErrorMessage} from '../../../../utils/get-error-message';
import {anonymizeIp} from '../../../../utils/anonymize-ip';

async function create({req, res}: PublicMethodContext) {
  const {token, date, event}: CreateMemberEventInput = req.body;

  if (!token || !date || !event) {
    return res.status(400).json(buildError('not args'));
  }

  const member = await prismadb.member.count({
    where: {
      token,
    },
  });

  if (!member) {
    return res.status(400).json(buildError('bad token'));
  }

  try {
    const ipAddress = requestIp.getClientIp(req);

    await prismadb.memberEvent.create({
      data: {
        date: new Date(date),
        memberToken: token,
        event,
        ipAddress: ipAddress ? anonymizeIp(ipAddress) : null,
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
  const {method} = req;
  const context: PublicMethodContext = {req, res};

  switch (method) {
    case 'POST':
      // Send data
      return create(context);
    default:
      return res.status(405).json(buildError('not allowed'));
  }
}
