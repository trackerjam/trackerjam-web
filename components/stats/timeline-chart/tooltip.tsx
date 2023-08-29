import {BarDatum} from '@nivo/bar';
import dynamic from 'next/dynamic';
import {useMemo} from 'react';
import {getTooltipData} from './get-tooltip-data';

const ResponsiveBar = dynamic(() => import('@nivo/bar').then((m) => m.ResponsiveBar), {
  ssr: false,
});

export interface TimeLineTooltipProps {
  domains: string[];
  data: BarDatum;
}
export function TimeLineTooltip({domains, data}: TimeLineTooltipProps) {
  const chartData = useMemo(() => {
    return getTooltipData({domains, data});
  }, [domains, data]);

  return (
    <div className="py-2 px-3 w-[380px] h-44 bg-white border border-gray-300 shadow-md">
      <div>Top domains</div>
      <div style={{width: '100%', height: '140px'}}>
        <ResponsiveBar
          margin={{top: 10, right: 10, bottom: 10, left: 130}}
          data={chartData}
          layout="horizontal"
          valueFormat="0.1f"
          colorBy="indexValue"
          label={(d) => d?.value?.toFixed(1) + 'm' || ''}
          labelSkipWidth={25}
          axisBottom={null}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
          }}
        />
      </div>
    </div>
  );
}
