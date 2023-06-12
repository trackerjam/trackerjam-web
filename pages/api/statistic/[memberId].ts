import {getServerSession} from 'next-auth/next';
import type {NextApiRequest, NextApiResponse} from 'next';
import {authOptions} from '../auth/[...nextauth]';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext, SessionId} from '../../../types/api';

async function get({req, res}: AuthMethodContext) {
  const memberId = req.query?.memberId as string;

  try {
    const member = await prismadb.member.findUniqueOrThrow({
      where: {
        id: memberId,
      },
    });

    const activities = await prismadb.domainActivity.findMany({
      where: {
        member: {
          id: member.id,
        },
      },
      include: {
        sessionActivities: true,
      },
    });

    const result = {
      member,
      activities,
    };

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
      return get({req, res, session});
    default:
      return res.status(405).json(buildError('not allowed'));
  }
}
