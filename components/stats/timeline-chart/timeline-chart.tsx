import {useMemo} from 'react';
import dynamic from 'next/dynamic';
import {MemberStatisticActivityType} from '../../../types/api';
import {getHourlyData} from './get-hourly-data';
import {extractDomainNames} from './extract-domain-names';
import {sortDomains} from './sort-domains';

const ResponsiveBar = dynamic(() => import('@nivo/bar').then((m) => m.ResponsiveBar), {
  ssr: false,
});

interface TimelineChartProps {
  data: MemberStatisticActivityType[] | null | undefined;
}

export function TimelineChart({data}: TimelineChartProps) {
  const {chartData = [], domains = []} = useMemo(() => {
    if (data?.length) {
      const chartData = getHourlyData(data);
      const domains = extractDomainNames(data);
      const sortedDomains = sortDomains(domains, chartData);
      return {
        chartData,
        domains: sortedDomains,
      };
    }
    return {};
  }, [data]);

  return (
    <ResponsiveBar
      data={chartData}
      keys={domains}
      indexBy="id"
      label={(d) => d?.value?.toFixed(2) || ''}
      valueFormat="0.1f"
      margin={{top: 50, right: 130, bottom: 50, left: 60}}
      padding={0.3}
      valueScale={{type: 'linear'}}
      indexScale={{type: 'band', round: true}}
      colors={{scheme: 'nivo'}}
      axisTop={null}
      axisRight={null}
      groupMode="stacked"
      maxValue={60}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'hour',
        legendPosition: 'middle',
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'minutes',
        legendPosition: 'middle',
        legendOffset: -40,
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: 'color',
        modifiers: [['darker', 1.6]],
      }}
      legends={[
        {
          dataFrom: 'keys',
          anchor: 'bottom-right',
          direction: 'column',
          justify: false,
          translateX: 120,
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: 'left-to-right',
          itemOpacity: 0.85,
          symbolSize: 20,
          effects: [
            {
              on: 'hover',
              style: {
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
      role="application"
      ariaLabel="Sessions distribution per domains in minutes"
    />
  );
}
