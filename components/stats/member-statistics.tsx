'use client';

import {useEffect, useMemo, useState} from 'react';
import {useStyletron} from 'baseui';
import {ButtonGroup, MODE, SIZE} from 'baseui/button-group';
import {Button} from 'baseui/button';
import {format} from 'date-fns';
import {Checkbox} from 'baseui/checkbox';
import {useGetData} from '../hooks/use-get-data';
import {ErrorDetails} from '../common/error-details';
import {CurrentDayActivityData, MemberStatisticType} from '../../types/api';
import DebugTable from './debug-table';

import {TimelineChart} from './timeline-chart/timeline-chart';
import {PieChart} from './pie-chart';
import {useAggregatedData} from './hooks/use-aggregated-data';
import {DomainsTable} from './domains-table';

const PIE_CHART_AND_TABLE_HEIGHT = '400px';

export function MemberStatistics({memberId}: {memberId: string}) {
  const [css, theme] = useStyletron();

  const {data, isLoading, error} = useGetData<MemberStatisticType>(`/api/statistic/${memberId}`);

  const hasData = Boolean(!isLoading && data);

  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [showIdle, setShowIdle] = useState<boolean>(false);
  const [hoveredId, setHoveredId] = useState<null | string>(null);

  const availableDates = useMemo(() => {
    if (data?.activitiesByDate) {
      return Object.keys(data?.activitiesByDate).sort((a: string, b: string) => {
        return new Date(a).getTime() - new Date(b).getTime();
      });
    }
  }, [data?.activitiesByDate]);

  useEffect(() => {
    if (availableDates?.length && currentDate === null) {
      setCurrentDate(availableDates[availableDates.length - 1]);
    }
  }, [availableDates, currentDate]);
  const selectedDateIdx = availableDates?.indexOf(currentDate || '');

  const currentDayData: CurrentDayActivityData | null | undefined = useMemo(() => {
    if (currentDate) {
      return data?.activitiesByDate[currentDate];
    }
    return null;
  }, [currentDate, data?.activitiesByDate]);

  const aggregatedData = useAggregatedData({currentDayData, showIdle});

  const handleChangeDate = (idx: number) => {
    setCurrentDate(availableDates?.[idx] || null);
  };

  const topStatWrapperStyle = css({
    display: 'flex',
    gap: theme.sizing.scale600,
    marginTop: theme.sizing.scale600,
  });

  const pieChartBlockStyle = css({
    width: 'min(50%, 600px)',
    height: PIE_CHART_AND_TABLE_HEIGHT,
    flexShrink: 0,
    borderRadius: theme.borders.radius300,
    ...theme.borders.border200,
  });

  const domainsTableStyle = css({
    flexGrow: 1,
  });

  const timelineChartStyle = css({
    flexGrow: 1,
    height: PIE_CHART_AND_TABLE_HEIGHT,
    borderRadius: theme.borders.radius300,
    marginTop: theme.sizing.scale600,
    ...theme.borders.border200,
  });

  const chartSettingsStyle = css({
    marginTop: theme.sizing.scale800,
  });

  return (
    <>
      <h1 className="font-bold text-28 mb-4 leading-tight">
        Statistic {data?.member ? `for ${data?.member?.name}` : ''}
      </h1>

      {isLoading && <span>Loading...</span>}
      {error && <ErrorDetails error={error} />}

      {hasData && (
        <>
          <div>
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

          {Boolean(currentDayData) && (
            <>
              <div className={chartSettingsStyle}>
                <Checkbox checked={showIdle} onChange={(e) => setShowIdle(e.target.checked)}>
                  Show Idle Time
                </Checkbox>
              </div>
              <div className={topStatWrapperStyle}>
                <div className={pieChartBlockStyle}>
                  <PieChart data={aggregatedData} hoveredId={hoveredId} onHover={setHoveredId} />
                </div>
                <div className={domainsTableStyle}>
                  <DomainsTable
                    data={aggregatedData}
                    height={PIE_CHART_AND_TABLE_HEIGHT}
                    totalActivityTime={currentDayData?.totalActivityTime}
                    hoveredId={hoveredId}
                    onHover={setHoveredId}
                  />
                </div>
              </div>

              <div className={timelineChartStyle}>
                <TimelineChart data={currentDayData?.activities} />
              </div>

              <div>
                <DebugTable data={currentDayData?.activities} />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
