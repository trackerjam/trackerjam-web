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

export function getHourlyData(
  data: MemberStatisticActivityType[],
  useLocalTime: boolean = false
): HourlyData[] {
  const hourlyData = Array.from({length: 24}, (_, i) => ({
    id: `${i.toString().padStart(2, '0')}h`,
    [TOTAL_KEY]: 0,
  })) as HourlyData[];

  const getHourIndex = (date: Date): number => {
    return useLocalTime ? date.getHours() : date.getUTCHours();
  };

  const adjustToLocalTime = (date: Date): Date => {
    return useLocalTime
      ? new Date(
          date.toLocaleString('en-US', {timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone})
        )
      : date;
  };

  data.forEach((session) => {
    session.sessionActivities.forEach((activity) => {
      const startUTC = new Date(activity.startDatetime);
      const endUTC = new Date(activity.endDatetime);

      let start = adjustToLocalTime(startUTC);
      let end = adjustToLocalTime(endUTC);

      // Calculate the original and adjusted hours
      const originalStartHour = startUTC.getUTCHours();
      const adjustedStartHour = start.getHours();

      // Filter out activities that fall into the next day after applying the local time zone
      if (useLocalTime && adjustedStartHour < originalStartHour) {
        return;
      }

      // Define the boundaries of the current day
      const startOfDay = new Date(start);
      const endOfDay = new Date(start);
      if (useLocalTime) {
        startOfDay.setHours(0, 0, 0, 0);
        endOfDay.setHours(23, 59, 59, 999);
      } else {
        startOfDay.setUTCHours(0, 0, 0, 0);
        endOfDay.setUTCHours(23, 59, 59, 999);
      }

      // Adjust start and end times to be within the current day
      if (start < startOfDay) start = startOfDay;
      if (end > endOfDay) end = endOfDay;

      // Ensure activity falls within the same day
      while (start < end && start <= endOfDay) {
        const hourIndex = getHourIndex(start);
        const nextHour = new Date(start);
        if (useLocalTime) {
          nextHour.setHours(hourIndex + 1, 0, 0);
        } else {
          nextHour.setUTCHours(hourIndex + 1, 0, 0);
        }
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
