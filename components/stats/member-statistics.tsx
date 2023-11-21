'use client';

import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';

import {format} from 'date-fns';

import {useGetData} from '../hooks/use-get-data';
import {ErrorDetails} from '../common/error-details';
import {DateActivityData, MemberStatisticType} from '../../types/api';

import {Button} from '../common/button';
import {Drawer} from '../common/drawer';
import {TimelineChart} from './timeline-chart/timeline-chart';
import {PieChart} from './pie-chart';
import {useAggregatedData} from './hooks/use-aggregated-data';
import {DomainsTable} from './domains-table';
import {StatCards} from './stat-cards/stat-cards';
import {UserDetails} from './user-details/user-details';
import {getMostRecentData} from './utils/get-most-recent-data';
import {EventsList} from './events-list';
import {RadarChart} from './radar-chart';
import {Trends} from './trends/trends';

export const PIE_CHART_AND_TABLE_HEIGHT = '400px';

export function MemberStatistics({memberId}: {memberId: string}) {
  const {data, isLoading, error} = useGetData<MemberStatisticType>(`/api/statistic/${memberId}`);

  const hasDataResponse = Boolean(!isLoading && data);

  const datesListRef = useRef<HTMLDivElement>(null);

  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [showIdle, setShowIdle] = useState<boolean>(false);
  const [hoveredLabel, setHoveredLabel] = useState<null | string>(null);
  const [focusedDomainName, setFocusedDomainName] = useState<string | null>(null);
  const [isEventsOpen, setIsEventsOpen] = useState<boolean>(false);

  const availableDates = useMemo(() => {
    if (data?.activitiesByDate) {
      return Object.keys(data?.activitiesByDate).sort((a: string, b: string) => {
        return new Date(a).getTime() - new Date(b).getTime();
      });
    }
  }, [data?.activitiesByDate]);

  const mostRecentDateData = useMemo(() => {
    if (!data?.activitiesByDate) {
      return null;
    }
    return getMostRecentData(data.activitiesByDate);
  }, [data]);

  useEffect(() => {
    if (availableDates?.length && currentDate === null) {
      setCurrentDate(availableDates[availableDates.length - 1]);
    }
  }, [availableDates, currentDate]);
  const selectedDateIdx = availableDates?.indexOf(currentDate || '');

  const currentDayData: DateActivityData | null | undefined = useMemo(() => {
    if (currentDate) {
      return data?.activitiesByDate[currentDate];
    }
    return null;
  }, [currentDate, data?.activitiesByDate]);

  const previousDayData: DateActivityData | null | undefined = useMemo(() => {
    if (currentDate && availableDates && availableDates?.length > 1) {
      const currentDatIndex = availableDates?.indexOf(currentDate);
      if (currentDatIndex !== 0) {
        const prevDay = availableDates[currentDatIndex - 1];
        return data?.activitiesByDate[prevDay];
      }
    }
    return null;
  }, [currentDate, availableDates, data?.activitiesByDate]);

  const aggregatedData = useAggregatedData({
    currentDayData,
    showIdle,
    focusOnDomain: focusedDomainName,
  });

  const handleChangeDate = (idx: number) => {
    setCurrentDate(availableDates?.[idx] || null);
  };

  useLayoutEffect(() => {
    datesListRef.current?.lastElementChild?.scrollIntoView({
      behavior: 'instant',
      block: 'nearest',
      inline: 'center',
    });
  }, [currentDate]);

  const hasCurrentDayData = Boolean(currentDayData);

  return (
    <div className="max-w-[calc(100vw-250px-65px)]">
      <div className="flex flex-col mb-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="font-bold text-28 leading-tight flex flex-row gap-1 items-center">
            <span className="text-gray-400">Statistics for</span>
            <span className="text-black">{data?.member ? `${data?.member?.name}` : '...'}</span>
          </h1>

          {hasDataResponse && (
            <div>
              <button
                className="text-gray-300 border-dashed border-b-2 border-gray-300"
                onClick={() => setIsEventsOpen(true)}
                aria-controls="events-drawer-list"
              >
                Events ({data?.member?.memberEvent?.length ?? 0})
              </button>
            </div>
          )}
        </div>
        {hasDataResponse && (
          <UserDetails
            data={mostRecentDateData}
            settings={data?.member?.settings}
            member={data?.member}
          />
        )}
      </div>

      {isLoading && <span>Loading...</span>}

      {!hasCurrentDayData && hasDataResponse && (
        <div className="flex flex-row justify-between items-center">
          <h3 className="text-gray-500 text-20">No data available yet</h3>
        </div>
      )}

      {error && <ErrorDetails error={error} />}

      {hasCurrentDayData && (
        <>
          <Trends
            data={data?.activitiesByDate}
            selectedDate={currentDate}
            onDateSelect={(dateStr) => setCurrentDate(dateStr)}
          />
          <div className="relative my-5 border-t-2 border-b-2 border-gray-100 before:h-full before:w-12 before:left-0 before:absolute before:bg-[linear-gradient(90deg,rgba(255,255,255,1)0%,rgba(255,255,255,0)100%)]">
            <div className="py-8 overflow-x-auto">
              {Boolean(availableDates?.length) && (
                <div className="flex gap-x-1" ref={datesListRef}>
                  {
                    availableDates?.map((dateStr, idx) => {
                      return (
                        <Button
                          className="whitespace-nowrap"
                          size="md"
                          kind={selectedDateIdx === idx ? 'black' : 'gray'}
                          key={dateStr}
                          onClick={() => handleChangeDate(idx)}
                        >
                          {format(new Date(dateStr), 'E, dd MMM')}
                        </Button>
                      );
                    }) as React.ReactNode[]
                  }
                </div>
              )}
            </div>
          </div>

          {Boolean(currentDayData) && (
            <StatCards data={currentDayData} previousDayData={previousDayData} />
          )}

          <Drawer
            id="events-drawer-list"
            isOpen={isEventsOpen}
            onClose={() => setIsEventsOpen(false)}
          >
            <EventsList events={data?.member?.memberEvent ?? []} />
          </Drawer>

          {Boolean(currentDayData) && (
            <>
              <div className="mt-6 flex items-center gap-1">
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  checked={showIdle}
                  onChange={(e) => setShowIdle(e.target.checked)}
                  id="show-idle-time"
                />
                <label htmlFor="show-idle-time">Show Idle Time</label>
                <span className="text-xs bg-slate-400 text-white px-1 rounded -mt-2 text-10">
                  Beta
                </span>
              </div>
              <div className="mt-8">
                <DomainsTable
                  data={aggregatedData}
                  height={PIE_CHART_AND_TABLE_HEIGHT}
                  hoveredLabel={hoveredLabel}
                  onHover={setHoveredLabel}
                  focusedDomainName={focusedDomainName}
                  onDomainFocus={setFocusedDomainName}
                />
              </div>
              <div className="flex mt-5 gap-4 2xl:flex-col">
                <div
                  className="grow shrink-0 rounded-lg border border-gray-200"
                  style={{
                    height: PIE_CHART_AND_TABLE_HEIGHT,
                  }}
                >
                  <h3 className="mt-4 ml-4 text-gray-600 text-12 font-bold">
                    Top {focusedDomainName ? 'pages' : 'domains'}
                    {Boolean(focusedDomainName) && ` for ${focusedDomainName}`}
                  </h3>
                  <PieChart
                    data={aggregatedData}
                    hoveredLabel={hoveredLabel}
                    onHover={setHoveredLabel}
                  />
                </div>
                <div
                  className="grow shrink-0 rounded-lg border border-gray-200"
                  style={{
                    height: PIE_CHART_AND_TABLE_HEIGHT,
                  }}
                >
                  <h3 className="mt-4 ml-4 text-gray-600 text-12 font-bold">Top categories</h3>
                  <RadarChart data={currentDayData?.activities} />
                </div>
              </div>

              <TimelineChart
                data={currentDayData?.activities}
                focusedDomainName={focusedDomainName}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
