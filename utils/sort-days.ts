import {DAY_ORDER} from '../const/member';

export function sortDays(days: string[]): string[] {
  return days.sort((a, b) => {
    return DAY_ORDER[a.toLowerCase()] - DAY_ORDER[b.toLowerCase()];
  });
}
