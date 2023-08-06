import {useMemo} from 'react';
import {CurrentDayActivityData} from '../../../types/api';
import {AggregatedDataType} from '../types';

export function useAggregatedData(
  currentDayData: CurrentDayActivityData | null | undefined,
  showIdle = false
): AggregatedDataType[] {
  return useMemo(() => {
    if (currentDayData) {
      const byDomains = currentDayData.activities.reduce(
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

      const dataValues = Object.values(byDomains);
      if (showIdle) {
        dataValues.push({
          id: '[Idle Time]',
          label: '[Idle Time]',
          value: currentDayData.idleTime,
          lastSession: null,
          sessionCount: 0,
        });
      }
      const sortedData = dataValues.sort((a, b) => b.value - a.value);
      return sortedData;
    }
    return [];
  }, [currentDayData, showIdle]);
}
