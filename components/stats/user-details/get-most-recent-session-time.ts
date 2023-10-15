import {MemberStatisticActivityType} from '../../../types/api';

export function getMostRecentSessionTime(activities: MemberStatisticActivityType[]) {
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

  // Get the current UTC time
  const currentUTC = new Date();

  // Calculate the difference in milliseconds
  return currentUTC.getTime() - latestTime.getTime();
}
