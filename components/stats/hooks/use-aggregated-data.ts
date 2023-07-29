import {useMemo} from 'react';
import {MemberStatisticActivityType} from '../../../types/api';
import {AggregatedDataType} from '../types';

export function useAggregatedData(
  currentDayData: MemberStatisticActivityType[] | null | undefined
) {
  return useMemo(() => {
    if (currentDayData) {
      const byDomains = currentDayData.reduce(
        (mem, {timeSpent, domainName, sessionActivities}) => {
          if (!mem[domainName]) {
            mem[domainName] = {
              id: domainName,
              label: domainName,
              value: 0,
              sessionCount: 0,
              lastSession: null,
            };
          }

          mem[domainName].value += timeSpent;
          mem[domainName].sessionCount += sessionActivities?.length || 0;

          const lastSession = sessionActivities.reduce((max, {endDatetime}) => {
            return Math.max(max, new Date(endDatetime).getTime());
          }, 0);
          mem[domainName].lastSession = mem[domainName].lastSession
            ? Math.max(mem[domainName].lastSession as number, lastSession)
            : lastSession;

          return mem;
        },
        {} as {[domain: string]: AggregatedDataType}
      );

      return Object.values(byDomains);
    }
    return [];
  }, [currentDayData]);
}
