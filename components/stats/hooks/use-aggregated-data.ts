import {useMemo} from 'react';
import {SessionActivity} from '@prisma/client';
import {DateActivityData} from '../../../types/api';
import {AggregatedDataType} from '../types';
import {IDLE_TIME_STR} from '../../../const/string';

interface UseAggregatedData {
  currentDayData: DateActivityData | null | undefined;
  showIdle: boolean;
  focusOnDomain?: string | null | undefined;
}

export function useAggregatedData({
  currentDayData,
  showIdle = false,
  focusOnDomain,
}: UseAggregatedData): AggregatedDataType[] {
  return useMemo(() => {
    if (currentDayData) {
      const byDomains = aggregateByDomain(currentDayData);

      let dataValues = Object.values(byDomains);
      if (showIdle) {
        dataValues.push({
          id: IDLE_TIME_STR,
          label: IDLE_TIME_STR,
          value: currentDayData.idleTime,
          lastSession: null,
          sessionCount: 0,
          children: [],
        });
      }

      if (focusOnDomain) {
        const focusedDomain = dataValues.find((domain) => domain.id === focusOnDomain);
        if (focusedDomain?.children) {
          dataValues = focusedDomain.children;
        }
      }

      const sortedData = dataValues.sort((a, b) => b.value - a.value);
      return sortedData;
    }
    return [];
  }, [currentDayData, focusOnDomain, showIdle]);
}

export function aggregateByDomain(data: DateActivityData) {
  return data.activities.reduce(
    (mem, {timeSpent, domainName, sessionActivities, domainsTags, productivityScore}) => {
      const aggregatedSessions = aggregateSessionsByTitle({sessionActivities, domainName});

      if (!mem[domainName]) {
        mem[domainName] = {
          id: domainName,
          label: domainName,
          value: 0,
          sessionCount: 0,
          lastSession: null,
          children: aggregatedSessions,
          domainsTags,
          productivityScore,
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
}

interface AggregateSessionsByTitle {
  sessionActivities: SessionActivity[];
  domainName: string;
}
export function aggregateSessionsByTitle({
  sessionActivities,
  domainName,
}: AggregateSessionsByTitle): AggregatedDataType[] {
  const aggregatedSessions = sessionActivities.reduce(
    (agg, session) => {
      const sessionLength =
        new Date(session.endDatetime).getTime() - new Date(session.startDatetime).getTime();

      const title = session.title ?? '<Unknown>';

      if (!agg[title]) {
        agg[title] = {totalLength: 0, count: 0};
      }
      agg[title].totalLength += sessionLength;
      agg[title].count += 1;
      return agg;
    },
    {} as {
      [title: string]: {
        totalLength: number;
        count: number;
      };
    }
  );

  return Object.entries(aggregatedSessions)
    .sort(([, a], [, b]) => b.totalLength - a.totalLength)
    .map(([title, {totalLength, count}]) => ({
      id: title,
      label: title,
      value: totalLength,
      sessionCount: count,
      _domainName: domainName,
    }));
}
