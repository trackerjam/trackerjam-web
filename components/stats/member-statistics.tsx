'use client';

import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';

import {format} from 'date-fns';
import {Drawer} from 'baseui/drawer';
import {useGetData} from '../hooks/use-get-data';
import {ErrorDetails} from '../common/error-details';
import {DateActivityData, MemberStatisticType} from '../../types/api';

import {Button} from '../common/button';
import {TimelineChart} from './timeline-chart/timeline-chart';
import {PieChart} from './pie-chart';
import {useAggregatedData} from './hooks/use-aggregated-data';
import {DomainsTable} from './domains-table';
import {StatCards} from './stat-cards/stat-cards';
import {UserDetails} from './user-details/user-details';
import {getMostRecentData} from './utils/get-most-recent-data';
import {EventsList} from './events-list';
import {RadarChart} from './radar-chart';

export const PIE_CHART_AND_TABLE_HEIGHT = '400px';

export function MemberStatistics({memberId}: {memberId: string}) {
  const {data, isLoading, error} = useGetData<MemberStatisticType>(`/api/statistic/${memberId}`);

  const hasData = Boolean(!isLoading && data);

  const itemsRef = useRef<HTMLDivElement>(null);

  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [showIdle, setShowIdle] = useState<boolean>(false);
  const [hoveredId, setHoveredId] = useState<null | string>(null);
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
    itemsRef.current?.lastElementChild?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [currentDate]);

  return (
    <div className="min-w-[1100px] max-w-[1300px]">
      <div className="flex flex-col mb-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="font-bold text-28 leading-tight flex flex-row gap-1 items-center">
            <span className="text-gray-400">Statistics for</span>
            <span className="text-black">{data?.member ? `${data?.member?.name}` : '...'}</span>
          </h1>

          {hasData && (
            <div>
              <button
                className="text-gray-300 border-dashed border-b-2 border-gray-300"
                onClick={() => setIsEventsOpen(true)}
              >
                Events ({data?.member?.memberEvent?.length ?? 0})
              </button>
            </div>
          )}
        </div>
        {hasData && <UserDetails data={mostRecentDateData} settings={data?.member?.settings} />}
      </div>

      {isLoading && <span>Loading...</span>}
      {error && <ErrorDetails error={error} />}

      {hasData && (
        <>
          <div className="my-4 border-t-2 border-b-2 border-gray-100 py-6 overflow-x-auto">
            {Boolean(availableDates?.length) && (
              <div className="flex gap-x-2" ref={itemsRef}>
                {
                  availableDates?.map((dateStr, idx) => {
                    return (
                      <Button
                        className="whitespace-nowrap"
                        size="sm"
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

          <StatCards data={currentDayData} previousDayData={previousDayData} />

          <Drawer
            isOpen={isEventsOpen}
            autoFocus
            onClose={() => setIsEventsOpen(false)}
            overrides={{
              Root: {
                style: {
                  zIndex: 11,
                },
              },
            }}
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
                  hoveredId={hoveredId}
                  onHover={setHoveredId}
                  focusedDomainName={focusedDomainName}
                  onDomainFocus={setFocusedDomainName}
                />
              </div>
              <div className="flex mt-5 gap-4">
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
                  <PieChart data={aggregatedData} hoveredId={hoveredId} onHover={setHoveredId} />
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
