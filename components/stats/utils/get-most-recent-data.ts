import {ActivitiesByDate, DateActivityData} from '../../../types/api';

export function getMostRecentData(activitiesByDate: ActivitiesByDate): DateActivityData {
  const mostRecentDate = Object.keys(activitiesByDate).reduce(
    (maxDate, currentDate) => (currentDate > maxDate ? currentDate : maxDate),
    ''
  );
  return activitiesByDate[mostRecentDate];
}
