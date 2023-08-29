import {OTHER_BUCKET_STR} from '../../../const/string';
import {HourlyData} from './get-hourly-data';

export function getDomainNamesFromData(data: HourlyData[]): string[] {
  const domainsSet: Set<string> = new Set();

  for (const entry of data) {
    for (const key in entry) {
      if (key !== 'id' && key !== 'total') {
        domainsSet.add(key);
      }
    }
  }

  const domains = Array.from(domainsSet);

  return domains.sort((a, b) => {
    if (a === OTHER_BUCKET_STR) return -1;
    if (b === OTHER_BUCKET_STR) return 1;

    const overallTotalA = data.reduce((acc, d) => acc + ((d?.[a] as number) || 0), 0);
    const overallTotalB = data.reduce((acc, d) => acc + ((d?.[b] as number) || 0), 0);

    return overallTotalA - overallTotalB;
  });
}
