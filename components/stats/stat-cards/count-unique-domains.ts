import {MemberStatisticActivityType} from '../../../types/api';

export function countUniqueDomains(activities: MemberStatisticActivityType[]) {
  const uniqueDomains = new Set<string>();
  for (const entry of activities) {
    uniqueDomains.add(entry.domainName);
  }
  return uniqueDomains.size;
}
