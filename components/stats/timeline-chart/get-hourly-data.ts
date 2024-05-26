import {MemberStatisticActivityType} from '../../../types/api';
import {OTHER_BUCKET_STR} from '../../../const/string';

export const TOTAL_KEY = 'total';

export type HourlyData = {
  id: string;
  [TOTAL_KEY]: number;
  [domainName: string]: number | string; // 'id' will be string, others will be numbers
};

// This helper function will keep only the top N domains and sum the rest into the "Other" bucket
function bucketizeDomains(hourData: HourlyData, N = 5): HourlyData {
  // Deep copy the input hourData
  const clonedHourData: HourlyData = JSON.parse(JSON.stringify(hourData));

  const domains: {[key: string]: number} = {};

  for (const key in clonedHourData) {
    if (key !== 'id' && key !== TOTAL_KEY) {
      domains[key] = clonedHourData[key] as number;
    }
  }

  const sortedDomains = Object.entries(domains)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);

  const topNDomains = new Set(sortedDomains.slice(0, N)); // Convert top domains to a set for easier look-up
  let otherValue = 0;

  // Go through all domain keys in clonedHourData
  for (const domain in domains) {
    if (!topNDomains.has(domain)) {
      otherValue += clonedHourData[domain] as number;
      delete clonedHourData[domain];
    }
  }

  // If there's any value accumulated in "Other", assign it
  if (otherValue > 0) {
    clonedHourData[OTHER_BUCKET_STR] = otherValue;
  }

  return clonedHourData;
}

export function getHourlyData(data: MemberStatisticActivityType[]): HourlyData[] {
  const hourlyData = Array.from({length: 24}, (_, i) => ({
    id: `${i.toString().padStart(2, '0')}h`,
    [TOTAL_KEY]: 0,
  })) as HourlyData[];

  data.forEach((session) => {
    session.sessionActivities.forEach((activity) => {
      let start = new Date(activity.startDatetime);
      let end = new Date(activity.endDatetime);

      // Correct end time if it exceeds the current day
      const endOfDay = new Date(start);
      endOfDay.setUTCHours(23, 59, 59);
      if (end > endOfDay) end = endOfDay;

      while (start < end) {
        const hourIndex = start.getUTCHours();
        const nextHour = new Date(start);
        nextHour.setUTCHours(hourIndex + 1, 0, 0);
        const intervalEnd = end > nextHour ? nextHour : end;
        const durationSeconds = (intervalEnd.getTime() - start.getTime()) / 1000;
        const currentHourData = hourlyData[hourIndex];

        // Ensure the domain property exists
        currentHourData[session.domainName] = currentHourData[session.domainName] || 0;

        // Update seconds for the current hour and total
        const secondsToAdd = Math.min(
          3600 - (currentHourData[session.domainName] as number),
          durationSeconds
        );

        // Ensure the domain property exists and is treated as a number
        if (typeof currentHourData[session.domainName] !== 'number') {
          currentHourData[session.domainName] = 0; // Ensure initialization as a number
        }
        (currentHourData[session.domainName] as number) += secondsToAdd;
        currentHourData[TOTAL_KEY] += secondsToAdd;

        // Move to next interval
        start = intervalEnd;
      }
    });
  });

  // Convert to minutes for domain-specific and total values
  hourlyData.forEach((hourData) => {
    Object.keys(hourData).forEach((key) => {
      if (key !== 'id' && key !== TOTAL_KEY) {
        hourData[key] = (hourData[key] as number) / 60;
      }
    });
    hourData[TOTAL_KEY] /= 60;
  });

  return hourlyData.map((d) => bucketizeDomains(d));
}
