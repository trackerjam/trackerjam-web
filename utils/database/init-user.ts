import type {User} from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
import prismadb from '../../lib/prismadb';
import {DEFAULT_TEAM_NAME} from '../../const/team';
import {sendWelcomeEmail} from '../api/email/send-welcome-email';
import {logger} from '../../lib/logger';

export async function initUserFirstTime(user: User) {
  const hasTeams = await userHasTeams(user.id);
  if (!hasTeams) {
    await createDefaultTeam(user.id);

    if (!user.email) {
      logger.error('Missing user email server');
      Sentry.captureMessage('Missing user email server');
    } else {
      await sendWelcomeEmail(user.email);
    }
  }
}

async function userHasTeams(userId: string) {
  const count = await prismadb.team.count({
    where: {
      ownerUserId: userId,
    },
  });

  return count > 0;
}
async function createDefaultTeam(userId: string) {
  return prismadb.team.create({
    data: {
      name: DEFAULT_TEAM_NAME,
      ownerUserId: userId,
    },
  });
}
