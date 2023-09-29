import {MemberStatisticActivityType} from '../../types/api';

/**
 * Quick Pauses Don't Count: Once you wrap up a task, any inactivity up to 3 minutes isn't labeled as idle.
 * We understand the need for brief moments to regroup.
 *
 * Breaks Beyond 3 Minutes: If there's more than a 3-minute gap between your tasks, we start to mark this time as idle.
 *
 * Capping Extended Breaks: Life happens—maybe it's lunch or just a longer pause.
 * We record this as idle but only up to 30 minutes. So, if you're away for longer, your idle time won't exceed
 * this half-hour mark.
 *
 * This method provides a balanced view of your activity, ensuring short breaks don't skew your stats while also
 * setting a reasonable limit on extended inactivity.
 */

const THREE_MINUTES_IN_MS = 3 * 60 * 1000;
const HALF_HOUR_IN_MS = 30 * 60 * 1000;

function toMs(dateString: string | Date): number {
  return new Date(dateString).getTime();
}

export function calculateIdleTime(activities: MemberStatisticActivityType[]) {
  let totalActivityTime = 0;
  let totalIdleTime = 0;

  const allSessions = activities.flatMap((session) => session.sessionActivities);

  if (!allSessions?.length) {
    return {
      idleTime: 0,
      totalActivityTime: 0,
    };
  }

  const sessions = [...allSessions].sort((a, b) => toMs(a.startDatetime) - toMs(b.startDatetime));

  // Summarize all activity times across all sessions
  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    const startTime = toMs(session.startDatetime);
    const endTime = toMs(session.endDatetime);
    totalActivityTime += endTime - startTime;

    if (i < sessions.length - 1) {
      // If this isn't the last session
      const nextSessionStart = toMs(sessions[i + 1].startDatetime);
      const idleDuration = nextSessionStart - endTime - THREE_MINUTES_IN_MS;

      if (idleDuration > 0) {
        totalIdleTime += Math.min(idleDuration, HALF_HOUR_IN_MS); // Cap the idle time at half hour
      }
    }
  }

  return {
    totalActivityTime,
    idleTime: totalIdleTime,
  };
}
