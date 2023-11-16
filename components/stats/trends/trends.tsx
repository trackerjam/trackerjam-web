import {useMemo} from 'react';
import dynamic from 'next/dynamic';
import {format} from 'date-fns';
import * as React from 'react';
import {ComputedBarDatum, BarDatum} from '@nivo/bar';
import {ActivitiesByDate} from '../../../types/api';
import {formatTimeDuration} from '../../../utils/format-time-duration';
import {CardElement} from '../stat-cards/card';
import {generateDateRangeKeys} from './generate-date-range';

const ResponsiveBar = dynamic(() => import('@nivo/bar').then((m) => m.ResponsiveBar), {
  ssr: false,
});

interface TrendsProps {
  data: ActivitiesByDate | undefined;
  selectedDate: string | null | undefined;
  onDateSelect: (date: string) => void;
}

type Props = {
  bars: ComputedBarDatum<BarDatum>[];
  hoveredIndex: string | null;
};

const TICK_WIDTH = 1;
const LABEL_Y_OFFSET = 35;
const LABEL_WIDTH = 80;
const LABEL_HEIGHT = 28;

// Should render a total above the hovered bar columns.
const BarTotal = ({bars, hoveredIndex}: Props): React.ReactNode => {
  if (!hoveredIndex) {
    return null;
  }

  const bar = bars.find((bar) => bar.data.indexValue === hoveredIndex);
  if (!bar) {
    return null;
  }
  const {data} = bar;
  const {x, y, width} = bar;
  if (!data?.value) {
    return null;
  }
  const label = formatTimeDuration(data.value, {skipSeconds: true});
  const borderColor = '#e0e0e0';

  return (
    <g transform={`translate(${x}, ${y - LABEL_Y_OFFSET})`}>
      <rect
        x={width / 2 - LABEL_WIDTH / 2}
        y={0}
        height={LABEL_HEIGHT}
        width={LABEL_WIDTH}
        fill="#fff"
        rx={4}
        style={{strokeWidth: 1, stroke: borderColor}}
      />
      <text
        transform={`translate(${width / 2}, ${LABEL_HEIGHT - 10})`}
        textAnchor="middle"
        fontSize="12px"
        fontFamily="sans-serif"
        fill="#000"
      >
        {label}
      </text>
      <rect
        x={width / 2 - TICK_WIDTH / 2}
        y={LABEL_HEIGHT}
        width={TICK_WIDTH}
        height={LABEL_Y_OFFSET - LABEL_HEIGHT}
        fill={borderColor}
      />
    </g>
  );
};

export function Trends({data, selectedDate, onDateSelect}: TrendsProps) {
  const [hoveredIndexValue, setHoveredIndexValue] = React.useState<string | null>(null);
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
    <div className="flex flex-row gap-3 xl:flex-col xl:gap-y-6">
      <div className="w-[70%] h-[270px] xl:w-full">
        <h3 className="mt-4 ml-4 text-gray-600 text-12 font-bold">Activity time by days</h3>
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
            margin={{top: 37, right: 10, bottom: 65, left: 10}}
            colors={(datum) => {
              if (datum?.indexValue === selectedDate && selectedDate) return '#589ec2';
              return '#a6cee3';
            }}
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
            tooltip={() => null}
            onClick={(datum) => {
              if (datum.indexValue) {
                onDateSelect(datum.indexValue as string);
              }
            }}
            onMouseEnter={(datum, event) => {
              setHoveredIndexValue(datum?.indexValue as string);
              event.currentTarget.style.cursor = 'pointer';
            }}
            onMouseLeave={() => setHoveredIndexValue(null)}
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
            isInteractive
            layers={[
              'grid',
              'axes',
              'bars',
              'markers',
              'legends',
              'annotations',
              (props) => <BarTotal bars={props.bars} hoveredIndex={hoveredIndexValue} />,
            ]}
          />
        )}
      </div>
      <div className="flex flex-row gap-2 items-end pb-5 xl:max-w-md">
        <CardElement className="flex-1">
          <div className="text-12 text-gray-400">All time average</div>
          <span className="text-gray-600 font-bold">
            {formatTimeDuration(averageAllTime, {skipSeconds: true})}
          </span>
        </CardElement>
        <CardElement className="flex-1">
          <div className="text-12 text-gray-400">7-day time average</div>
          <span className="text-gray-600 font-bold">
            {formatTimeDuration(averageLast7Days, {skipSeconds: true})}
          </span>
        </CardElement>
      </div>
    </div>
  );
}
