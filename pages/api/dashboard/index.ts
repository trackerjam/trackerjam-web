import type {NextApiRequest, NextApiResponse} from 'next';
import * as Sentry from '@sentry/nextjs';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext, DashboardResponse} from '../../../types/api';
import {DEFAULT_TEAM_NAME} from '../../../const/team';
import {endpointHandler} from '../../../utils/api/handler';

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
    res.status(500).json(buildError(getErrorMessage(e)));
    Sentry.captureException(e);
    console.error(e);
  }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return endpointHandler({req, res, handlers: {get}});
}
