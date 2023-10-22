import {useMemo} from 'react';
import dynamic from 'next/dynamic';
import {format} from 'date-fns';
import {ActivitiesByDate} from '../../../types/api';
import {formatTimeDuration} from '../../../utils/format-time-duration';
import {CardElement} from '../stat-cards/card';
import {generateDateRangeKeys} from './generate-date-range';
import {Tooltip} from './tooltip';

const ResponsiveBar = dynamic(() => import('@nivo/bar').then((m) => m.ResponsiveBar), {
  ssr: false,
});

interface TrendsProps {
  data: ActivitiesByDate | undefined;
}

export function Trends({data}: TrendsProps) {
  const {chartData, averageAllTime, averageLast7Days} = useMemo(() => {
    if (!data) {
      return {
        chartData: [],
        averageAllTime: 0,
        averageLast7Days: 0,
      };
    }

    const dateRange = generateDateRangeKeys(Object.keys(data), {addExtraDays: 2});

    const chartData = dateRange.map((date) => {
      return {id: date, totalActivityTime: data[date]?.totalActivityTime || 0};
    });

    // Calculate the sum of the activity times and the average for all time.
    const totalActivityTime = chartData.reduce((sum, day) => sum + day.totalActivityTime, 0);
    const averageAllTime = chartData.length ? totalActivityTime / chartData.length : 0;

    // Calculate the average for the last 7 days.
    // First, we need to ensure there are at least 7 days of data, or handle the available amount.
    const last7DaysData = chartData.slice(Math.max(chartData.length - 7, 0)); // Get last 7 days of data
    const totalActivityLast7Days = last7DaysData.reduce(
      (sum, day) => sum + day.totalActivityTime,
      0
    );
    const averageLast7Days = last7DaysData.length
      ? totalActivityLast7Days / last7DaysData.length
      : 0;

    return {
      chartData,
      averageAllTime: Math.round(averageAllTime),
      averageLast7Days: Math.round(averageLast7Days),
    };
  }, [data]);

  const hasData = Boolean(chartData.length);

  return (
    <div className="flex flex-row gap-3">
      <div className="w-[70%] h-[160px]">
        <h3 className="mt-4 ml-4 text-gray-600 text-12 font-bold">Activity by days</h3>
        {!hasData && (
          <div className="flex items-center justify-center h-full text-gray-400">
            No data available yet, check back later.
          </div>
        )}
        {hasData && (
          <ResponsiveBar
            data={chartData}
            keys={['totalActivityTime']}
            indexBy="id"
            enableLabel={false}
            valueFormat="0.0f"
            margin={{top: 15, right: 10, bottom: 65, left: 10}}
            colors={{scheme: 'paired'}}
            padding={0.3}
            valueScale={{type: 'linear'}}
            indexScale={{type: 'band', round: true}}
            axisTop={null}
            axisRight={null}
            groupMode="stacked"
            maxValue="auto"
            animate={false}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -50,
              legend: null,
              legendPosition: 'middle',
              legendOffset: 32,
              format: (dateStr: string) => {
                return format(new Date(dateStr), 'd MMM');
              },
            }}
            axisLeft={null}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{
              from: 'color',
              modifiers: [['darker', 1.6]],
            }}
            role="application"
            tooltip={({indexValue, value}) => <Tooltip indexValue={indexValue} value={value} />}
            theme={{
              grid: {
                line: {
                  stroke: '#eee',
                  strokeWidth: 1,
                },
              },
              axis: {
                ticks: {
                  text: {
                    fill: '#999',
                  },
                },
              },
            }}
          />
        )}
      </div>
      <div className="flex flex-row gap-2 items-end pb-5">
        <CardElement>
          <div className="text-12 text-gray-400">All time average</div>
          <span className="text-gray-600 font-bold">
            {formatTimeDuration(averageAllTime, {skipSeconds: true})}
          </span>
        </CardElement>
        <CardElement>
          <div className="text-12 text-gray-400">7-day time average</div>
          <span className="text-gray-600 font-bold">
            {formatTimeDuration(averageLast7Days, {skipSeconds: true})}
          </span>
        </CardElement>
      </div>
    </div>
  );
}
