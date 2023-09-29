import dynamic from 'next/dynamic';
import {useMemo} from 'react';
import {CardElement} from './card';
import {ProductivityScoreType} from './types';

const ResponsiveBar = dynamic(() => import('@nivo/bar').then((m) => m.ResponsiveBar), {
  ssr: false,
});

interface ProductivityBarProps {
  stat:
    | {
        value: ProductivityScoreType;
      }
    | undefined;
}

export function ProductivityBar({stat}: ProductivityBarProps) {
  const chartData = useMemo(() => {
    if (stat?.value) {
      return [
        {
          id: 'score',
          ...stat.value,
        },
      ];
    }
    return [];
  }, [stat]);

  const hasData = Boolean(chartData.length);

  return (
    <CardElement>
      <div className="text-sm text-gray-400">Productivity Score</div>
      <div
        className="flex items-center gap-3 justify-center"
        style={{width: '160px', height: '32px'}}
      >
        {!hasData && <span className="text-gray-600 text-22 font-bold">...</span>}
        {hasData && (
          <ResponsiveBar
            keys={['low', 'neutral', 'high']}
            data={chartData}
            groupMode="stacked"
            layout="horizontal"
            margin={{top: 0, right: 0, bottom: 0, left: 0}}
            axisBottom={null}
            valueFormat={(val) => val.toFixed(0) + '%'}
            labelSkipWidth={18}
            colors={['#ff746f', '#ffc95c', '#1ec460']}
          />
        )}
      </div>
    </CardElement>
  );
}
