import Head from 'next/head';
import {LabelLarge as Title} from 'baseui/typography';
import {useRouter} from 'next/router';
import {useEffect, useMemo, useState} from 'react';
import {useStyletron} from 'baseui';
import {ButtonGroup, MODE, SIZE} from 'baseui/button-group';
import {Button} from 'baseui/button';
import {format} from 'date-fns';
import {useGetData} from '../hooks/use-get-data';
import {ErrorDetails} from '../common/error-details';
import {MemberStatisticActivityType, MemberStatisticType} from '../../types/api';
import DebugTable from './debug-table';
import {TimelineChart} from './timeline-chart/timeline-chart';
import {PieChart} from './pie-chart';
import {useAggregatedData} from './hooks/use-aggregated-data';
import {DomainTable} from './domain-table';

export function MemberStatistics() {
  const [css, theme] = useStyletron();
  const {
    query: {memberId},
  } = useRouter();
  const {data, isLoading, error} = useGetData<MemberStatisticType>(`/api/statistic/${memberId}`);
  const hasData = Boolean(!isLoading && data);
  const [currentDate, setCurrentDate] = useState<string | null>(null);

  const availableDates = useMemo(() => {
    if (data?.activities) {
      return Object.keys(data?.activities).sort((a: string, b: string) => {
        return new Date(a).getTime() - new Date(b).getTime();
      });
    }
  }, [data?.activities]);

  useEffect(() => {
    if (availableDates?.length && currentDate === null) {
      setCurrentDate(availableDates[availableDates.length - 1]);
    }
  }, [availableDates, currentDate]);
  const selectedDateIdx = availableDates?.indexOf(currentDate || '');

  const currentDayData: MemberStatisticActivityType[] | null | undefined = useMemo(() => {
    if (currentDate) {
      return data?.activities[currentDate];
    }
    return null;
  }, [currentDate, data?.activities]);

  const aggregatedData = useAggregatedData(currentDayData);

  const handleChangeDate = (idx: number) => {
    setCurrentDate(availableDates?.[idx] || null);
  };

  const topStatWrapperStyle = css({
    display: 'flex',
    gap: theme.sizing.scale600,
    marginTop: theme.sizing.scale600,
  });

  const chartBlockStyle = css({
    width: 'min(50%, 600px)',
    height: '400px',
    borderRadius: theme.borders.radius300,
    ...theme.borders.border200,
  });

  const timelineChartStyle = css({
    width: '1100px',
    height: '400px',
    borderRadius: theme.borders.radius300,
    marginTop: theme.sizing.scale600,
    ...theme.borders.border200,
  });

  return (
    <div>
      <Head>
        <title>Statistics</title>
      </Head>

      <Title marginBottom="scale600">
        Statistic {data?.member ? `for ${data?.member?.name}` : ''}
      </Title>

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
              <div className={topStatWrapperStyle}>
                <div className={chartBlockStyle}>
                  <PieChart data={aggregatedData} />
                </div>
                <div>
                  <DomainTable data={aggregatedData} height="400px" />
                </div>
              </div>

              <div className={timelineChartStyle}>
                <TimelineChart data={currentDayData} />
              </div>

              <div>
                <DebugTable data={currentDayData} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
