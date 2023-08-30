import dynamic from 'next/dynamic';
import {useMemo} from 'react';
import {HeatMapDatum} from '@nivo/heatmap';
import {formatTimeDuration} from '../../../utils/format-time-duration';
import {MemberStatisticActivityType} from '../../../types/api';

const ResponsiveHeatMap = dynamic(() => import('@nivo/heatmap').then((m) => m.ResponsiveHeatMap), {
  ssr: false,
});

function generateHeatmapData(sessions: MemberStatisticActivityType[]) {
  // Initialize the heatmap data
  const heatmapData: {id: string; data: HeatMapDatum[]}[] = [];
  for (let h = 0; h < 24; h++) {
    const hourData = {
      id: (h < 10 ? '0' : '') + h + 'h',
      data: [] as HeatMapDatum[],
    };
    for (let m = 0; m < 60; m += 10) {
      hourData.data.push({
        x: (m < 10 ? '0' : '') + m + 'min',
        y: 0,
      });
    }
    heatmapData.push(hourData);
  }

  // Process each session
  sessions.forEach((session) => {
    session.sessionActivities.forEach((activity) => {
      const start = new Date(activity.startDatetime);
      const end = new Date(activity.endDatetime);
      const startTimeMinutes = start.getUTCMinutes();
      const endTimeMinutes = end.getUTCMinutes();

      for (let m = Math.floor(startTimeMinutes / 10) * 10; m <= endTimeMinutes; m += 10) {
        // Determine the time spent in this 10-minute block
        const blockStart = m;
        const blockEnd = m + 10;

        const overlapStart = Math.max(blockStart, startTimeMinutes);
        const overlapEnd = Math.min(blockEnd, endTimeMinutes);

        const timeSpent = (overlapEnd - overlapStart) * 60 * 1000; // in milliseconds

        // Update the heatmap data
        heatmapData[start.getUTCHours()].data[m / 10].y += timeSpent;
      }
    });
  });

  return heatmapData;
}

export function HeatMap({data}: {data: MemberStatisticActivityType[] | undefined}) {
  const chartData = useMemo(() => {
    if (!data) {
      return [];
    }
    return generateHeatmapData(data);
  }, [data]);

  return (
    <ResponsiveHeatMap
      data={chartData}
      margin={{top: 60, right: 90, bottom: 60, left: 90}}
      valueFormat={(value) => formatTimeDuration(value)}
      axisTop={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -90,
        legend: '',
        legendOffset: 46,
      }}
      colors={{
        type: 'diverging',
        scheme: 'yellow_green',
        divergeAt: 0.6,
      }}
      emptyColor="#555555"
      legends={[
        {
          anchor: 'bottom',
          translateX: 0,
          translateY: 30,
          length: 400,
          thickness: 8,
          direction: 'row',
          tickPosition: 'after',
          tickSize: 3,
          tickSpacing: 4,
          tickOverlap: false,
          tickFormat: '>-.2s',
          title: 'Value →',
          titleAlign: 'start',
          titleOffset: 4,
        },
      ]}
      enableGridX={true}
      enableGridY={true}
      borderWidth={1}
      borderColor={{from: 'color', modifiers: [['darker', 0.2]]}}
    />
  );
}
