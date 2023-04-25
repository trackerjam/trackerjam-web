// eslint-disable-next-line camelcase
import {getServerSession} from 'next-auth/next';
import type {NextApiRequest, NextApiResponse} from 'next';
import {authOptions} from '../auth/[...nextauth]';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';

import {SessionId} from '../../../types/api';
import {DEFAULT_TEAM_NAME} from '../../../const/team';
async function createDefaultRecord(session: SessionId) {
  return prismadb.team.create({
    data: {
      name: DEFAULT_TEAM_NAME,
      ownerUserId: session.user.id,
    },
  });
}
async function get(res: NextApiResponse, session: SessionId) {
  const getData = () =>
    prismadb.team.findMany({
      where: {
        ownerUserId: session.user.id,
      },
      include: {
        members: true,
      },
    });

  try {
    let result = await getData();
    if (!result.length) {
      await createDefaultRecord(session);
      result = await getData();
    }
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
