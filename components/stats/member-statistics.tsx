'use client';

import {useEffect, useMemo, useState} from 'react';
import {useStyletron} from 'baseui';
import {ButtonGroup, MODE, SIZE} from 'baseui/button-group';
import {Button} from 'baseui/button';
import {format} from 'date-fns';
import {Checkbox} from 'baseui/checkbox';
import {Drawer} from 'baseui/drawer';
import {useGetData} from '../hooks/use-get-data';
import {ErrorDetails} from '../common/error-details';
import {DateActivityData, MemberStatisticType} from '../../types/api';

import {TimelineChart} from './timeline-chart/timeline-chart';
import {PieChart} from './pie-chart';
import {useAggregatedData} from './hooks/use-aggregated-data';
import {DomainsTable} from './domains-table';
import {StatCards} from './stat-cards/stat-cards';
import {UserStatus} from './user-status/user-status';
import {getMostRecentData} from './utils/get-most-recent-data';
import {EventsList} from './events-list';

export const PIE_CHART_AND_TABLE_HEIGHT = '400px';

export function MemberStatistics({memberId}: {memberId: string}) {
  const [css, theme] = useStyletron();

  const {data, isLoading, error} = useGetData<MemberStatisticType>(`/api/statistic/${memberId}`);

  const hasData = Boolean(!isLoading && data);

  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [showIdle, setShowIdle] = useState<boolean>(false);
  const [hoveredId, setHoveredId] = useState<null | string>(null);
  const [focusedDomainId, setFocusedDomainId] = useState<null | string>(null);
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
    focusOnDomain: focusedDomainId,
  });

  const handleChangeDate = (idx: number) => {
    setCurrentDate(availableDates?.[idx] || null);
  };

  const pieChartBlockStyle = css({
    width: 'min(50%, 600px)',
    height: PIE_CHART_AND_TABLE_HEIGHT,
    flexShrink: 0,
    borderRadius: theme.borders.radius300,
    ...theme.borders.border200,
  });

  const chartSettingsStyle = css({
    marginTop: theme.sizing.scale800,
  });

  return (
    <>
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
        {hasData && <UserStatus data={mostRecentDateData} settings={data?.member?.settings} />}
      </div>

      {isLoading && <span>Loading...</span>}
      {error && <ErrorDetails error={error} />}

      {hasData && (
        <>
          <div className="my-4 border-t-2 border-b-2 border-gray-100 py-4">
            {Boolean(availableDates?.length) && (
              <ButtonGroup
                size={SIZE.compact}
                mode={MODE.radio}
                selected={selectedDateIdx}
                onClick={(_, idx) => handleChangeDate(idx)}
              >
                {
                  availableDates?.map((dateStr) => {
                    return <Button key={dateStr}>{format(new Date(dateStr), 'E, dd MMM')}</Button>;
                  }) as React.ReactNode[]
                }
              </ButtonGroup>
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
              <div className={chartSettingsStyle}>
                <Checkbox checked={showIdle} onChange={(e) => setShowIdle(e.target.checked)}>
                  Show Idle Time
                </Checkbox>
              </div>
              <div className="flex mt-5 gap-4">
                <div className={pieChartBlockStyle}>
                  <PieChart data={aggregatedData} hoveredId={hoveredId} onHover={setHoveredId} />
                </div>
                <DomainsTable
                  data={aggregatedData}
                  height={PIE_CHART_AND_TABLE_HEIGHT}
                  hoveredId={hoveredId}
                  onHover={setHoveredId}
                  focusedDomainId={focusedDomainId}
                  onDomainFocus={setFocusedDomainId}
                />
              </div>

              <TimelineChart data={currentDayData?.activities} focusedDomainId={focusedDomainId} />
            </>
          )}
        </>
      )}
    </>
  );
}
