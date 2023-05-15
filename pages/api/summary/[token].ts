import {getServerSession} from 'next-auth/next';
import type {NextApiRequest, NextApiResponse} from 'next';
import {authOptions} from '../auth/[...nextauth]';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext, SessionId} from '../../../types/api';

async function get({req, res}: AuthMethodContext) {
  const {token} = req.query as {token: string};

  if (!token) {
    return res.status(400).json(buildError('bad params'));
  }

  try {
    // TODO Accept array of tokens

    const summary = await prismadb.summary.findUnique({
      where: {
        date_memberToken: {
          date: new Date(),
          memberToken: token,
        },
      },
    });

    const {activityTime, domainsCount, sessionCount} = summary || {};
    const response = summary
      ? {
          activityTime,
          domainsCount,
          sessionCount,
        }
      : {};

    res.json(response);
  } catch (e) {
    console.error(e);
    res.status(500).json(buildError(getErrorMessage(e)));
  }
}

// TODO unify API interface
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
