import {MemberStatisticActivityType} from '../types/api';

export function getMostRecentSessionTs(activities: MemberStatisticActivityType[]) {
  let latestTime = new Date(0); // initialize with a very early date for comparison

  // Iterate through the data
  for (const entry of activities) {
    for (const activity of entry.sessionActivities) {
      const endTime = new Date(activity.endDatetime);
      if (endTime > latestTime) {
        latestTime = endTime;
      }
    }
  }

  return latestTime.getTime();
}
