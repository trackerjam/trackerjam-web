import {MemberStatisticActivityType} from '../../../types/api';

export function calcHttpsPercentage(activities: MemberStatisticActivityType[]) {
  let totalActivities = 0;
  let httpsActivities = 0;

  // Iterate through the data
  for (const entry of activities) {
    for (const session of entry.sessionActivities) {
      // Increment the count for total activities and HTTPS activities
      totalActivities++;
      if (session.isHTTPS) {
        httpsActivities++;
      }
    }
  }

  const percentage = (httpsActivities / totalActivities) * 100;
  return Math.round(percentage) + '%';
}
