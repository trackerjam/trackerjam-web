import Head from 'next/head';
import {LabelLarge as Title} from 'baseui/typography';
import {useRouter} from 'next/router';
import dynamic from 'next/dynamic';
import {useEffect, useMemo, useState} from 'react';
import {useStyletron} from 'baseui';
import {ButtonGroup, MODE, SIZE} from 'baseui/button-group';
import {Button} from 'baseui/button';
import {format, formatDistanceToNow} from 'date-fns';
import {DIVIDER, TableBuilder, TableBuilderColumn} from 'baseui/table-semantic';
import {useGetData} from '../hooks/use-get-data';
import {ErrorDetails} from '../common/error-details';
import {MemberStatisticType} from '../../types/api';
import {formatTimeDuration} from '../../utils/format-time-duration';
import brandColors from './brand-colors.json';
import Table from './table';

type ChartAndTableType = {
  id: string;
  label: string;
  value: number;
  sessionCount: number;
  lastSession: number | null;
  color: string;
};

// Read more about this import issue: https://github.com/plouc/nivo/issues/2310
const ResponsivePie = dynamic(() => import('@nivo/pie').then((m) => m.ResponsivePie), {
  ssr: false,
});

function getColorByDomain(domain: string): string {
  const domainNoTld = domain.split('.')[0];
  const colors = (brandColors as {[domain: string]: Array<string>})[domainNoTld];
  return colors?.length ? '#' + colors[0] : 'transparent';
}

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

  const pieData = useMemo(() => {
    if (data?.activities && currentDate) {
      const byDomains = data?.activities[currentDate].reduce(
        (mem, {timeSpent, domainName, sessionActivities}) => {
          if (!mem[domainName]) {
            mem[domainName] = {
              id: domainName,
              label: domainName,
              value: 0,
              sessionCount: 0,
              lastSession: null,
              color: getColorByDomain(domainName),
            };
          }

          mem[domainName].value += timeSpent;
          mem[domainName].sessionCount += sessionActivities?.length || 0;
          mem[domainName].lastSession = sessionActivities.reduce((max, {endDatetime}) => {
            return Math.max(max, new Date(endDatetime).getTime());
          }, 0);

          return mem;
        },
        {} as {[domain: string]: ChartAndTableType}
      );

      return Object.values(byDomains);
    }
    return [];
  }, [data?.activities, currentDate]);

  const handleChangeDate = (idx: number) => {
    setCurrentDate(availableDates?.[idx] || null);
  };

  const pieChartStyle = css({
    ...theme.borders.border200,
    width: 'min(600px, 100%)',
    height: '400px',
    marginTop: theme.sizing.scale600,
    borderRadius: theme.borders.radius300,
  });

  const tableWrapperStyle = css({
    marginTop: theme.sizing.scale600,
  });

  const domainLabelStyle = css({
    display: 'flex',
    gap: theme.sizing.scale400,
  });

  const domainColorTagStyle = css({
    width: theme.sizing.scale600,
    height: theme.sizing.scale600,
    borderRadius: '50%',
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

          <div className={pieChartStyle}>
            <ResponsivePie
              data={pieData}
              valueFormat={(value) => formatTimeDuration(value)}
              margin={{top: 40, right: 20, bottom: 80, left: 80}}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              borderWidth={1}
              sortByValue={true}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 0.2]],
              }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{from: 'color'}}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{
                from: 'color',
                modifiers: [['darker', 2]],
              }}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  itemsSpacing: 0,
                  translateX: 0,
                  translateY: 60,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: '#999',
                  itemDirection: 'left-to-right',
                  itemOpacity: 1,
                  symbolSize: 18,
                  symbolShape: 'circle',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemTextColor: '#000',
                      },
                    },
                  ],
                },
              ]}
            />
          </div>

          <div className={tableWrapperStyle}>
            <TableBuilder data={pieData} divider={DIVIDER.grid}>
              <TableBuilderColumn header="Domain">
                {(row: ChartAndTableType) => (
                  <div className={domainLabelStyle}>
                    <span
                      className={domainColorTagStyle}
                      style={{backgroundColor: getColorByDomain(row.label)}}
                    />
                    <span>{row.label}</span>
                  </div>
                )}
              </TableBuilderColumn>
              <TableBuilderColumn header="Activity Time">
                {(row: ChartAndTableType) => formatTimeDuration(row.value)}
              </TableBuilderColumn>
              <TableBuilderColumn header="Sessions Count">
                {(row: ChartAndTableType) => row.sessionCount}
              </TableBuilderColumn>
              <TableBuilderColumn header="Last Session">
                {(row: ChartAndTableType) =>
                  row.lastSession ? formatDistanceToNow(new Date(row.lastSession)) : '-'
                }
              </TableBuilderColumn>
            </TableBuilder>
          </div>

          {currentDate && (
            <div>
              <br />
              <h3>Debug table</h3>

              <Table data={data?.activities[currentDate]} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
