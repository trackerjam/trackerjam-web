import {MemberStatisticActivityType} from '../../types/api';

function toMs(dateString: string | Date): number {
  return new Date(dateString).getTime();
}
export function calculateIdleTime(activities: MemberStatisticActivityType[]) {
  let totalActivityTime = 0;

  const allSessions = activities.flatMap((session) => session.sessionActivities);
  const sessions = [...allSessions].sort((a, b) => toMs(a.startDatetime) - toMs(b.startDatetime));

  // Summarize all activity times across all sessions
  for (const session of sessions) {
    const startTime = toMs(session.startDatetime);
    const endTime = toMs(session.endDatetime);
    totalActivityTime += endTime - startTime;
  }

  // Calculate the activity range
  const firstSessionEndTime = toMs(sessions[0].endDatetime);
  const lastSessionStartTime = toMs(sessions[sessions.length - 1].startDatetime);
  const activityRange = lastSessionStartTime - firstSessionEndTime;

  // Calculate idle time
  const idleTime = activityRange - totalActivityTime;

  return {
    totalActivityTime,
    idleTime,
  };
}
