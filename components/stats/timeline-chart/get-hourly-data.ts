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
    id: String(i).padStart(2, '0') + 'h',
    [TOTAL_KEY]: 0, // Initialize the 'total' property to 0 for each hour
  })) as HourlyData[];

  data.forEach((session) => {
    session.sessionActivities.forEach((activity) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const start = new Date(Date.parse(activity.startDatetime));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const end = new Date(Date.parse(activity.endDatetime));

      // Convert start and end dates to UTC
      let startUTC = new Date(
        Date.UTC(
          start.getUTCFullYear(),
          start.getUTCMonth(),
          start.getUTCDate(),
          start.getUTCHours(),
          start.getUTCMinutes(),
          start.getUTCSeconds()
        )
      );
      let endUTC = new Date(
        Date.UTC(
          end.getUTCFullYear(),
          end.getUTCMonth(),
          end.getUTCDate(),
          end.getUTCHours(),
          end.getUTCMinutes(),
          end.getUTCSeconds()
        )
      );

      // Adjust the end time if it exceeds the day boundary
      const endOfDay = new Date(
        Date.UTC(
          startUTC.getUTCFullYear(),
          startUTC.getUTCMonth(),
          startUTC.getUTCDate(),
          23,
          59,
          59
        )
      );
      if (endUTC > endOfDay) {
        endUTC = endOfDay;
      }

      let durationSeconds = (endUTC.getTime() - startUTC.getTime()) / 1000; // Convert to seconds

      while (durationSeconds > 0) {
        const currentHour = startUTC.getUTCHours();
        const endOfCurrentHour = new Date(
          Date.UTC(
            startUTC.getUTCFullYear(),
            startUTC.getUTCMonth(),
            startUTC.getUTCDate(),
            currentHour + 1,
            0,
            0
          )
        );

        let currentHourSeconds;
        if (endUTC > endOfCurrentHour) {
          currentHourSeconds = (endOfCurrentHour.getTime() - startUTC.getTime()) / 1000; // Convert to seconds
          startUTC = endOfCurrentHour;
        } else {
          currentHourSeconds = durationSeconds;
        }

        if (!hourlyData[currentHour][session.domainName]) {
          hourlyData[currentHour][session.domainName] = 0;
        }

        // Add the current hour's seconds but make sure not to exceed 3600 seconds (1 hour)
        const totalSecondsInCurrentHour = hourlyData[currentHour][session.domainName] as number;
        const remainingSeconds = 3600 - totalSecondsInCurrentHour;
        const secondsToAdd = Math.min(remainingSeconds, currentHourSeconds);
        (hourlyData[currentHour][session.domainName] as number) += secondsToAdd;

        // Update the 'total' property in seconds
        hourlyData[currentHour][TOTAL_KEY] += secondsToAdd;

        durationSeconds -= currentHourSeconds;
      }
    });
  });

  // Convert all values (except 'id' and 'total') from seconds to minutes
  hourlyData.forEach((hourData) => {
    for (const key in hourData) {
      if (key !== 'id' && key !== TOTAL_KEY) {
        hourData[key] = (hourData[key] as number) / 60;
      }
    }
  });

  // Convert the 'total' property from seconds to minutes
  hourlyData.forEach((hourData) => {
    hourData[TOTAL_KEY] /= 60;
  });

  return hourlyData.map((d) => bucketizeDomains(d));
}
