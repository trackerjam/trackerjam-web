import {MemberStatisticActivityType} from '../../../types/api';

export function getDomainWithLongestSession(activities: MemberStatisticActivityType[]) {
  const domainDurations: {[domain: string]: number} = {};

  // Iterate through the data and accumulate the durations for each domain
  for (const entry of activities) {
    const domain = entry.domainName;
    for (const activity of entry.sessionActivities) {
      const startTime = new Date(activity.startDatetime).getTime();
      const endTime = new Date(activity.endDatetime).getTime();
      const duration = endTime - startTime;

      domainDurations[domain] = (domainDurations[domain] || 0) + duration;
    }
  }

  // Find the domain with the maximum accumulated duration
  let maxDuration = 0;
  let domainWithLongestDuration = null;
  for (const domain in domainDurations) {
    if (domainDurations[domain] > maxDuration) {
      maxDuration = domainDurations[domain];
      domainWithLongestDuration = domain;
    }
  }

  return domainWithLongestDuration;
}
