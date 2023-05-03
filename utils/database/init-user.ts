import prismadb from '../../lib/prismadb';
import {DEFAULT_TEAM_NAME} from '../../const/team';
export async function initUserFirstTime(userId: string) {
  const hasTeams = await userHasTeams(userId);
  if (!hasTeams) {
    await createDefaultTeam(userId);
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
