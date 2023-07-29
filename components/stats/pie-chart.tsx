import dynamic from 'next/dynamic';
import {formatTimeDuration} from '../../utils/format-time-duration';
import {AggregatedDataType} from './types';

// Read more about this import issue: https://github.com/plouc/nivo/issues/2310
const ResponsivePie = dynamic(() => import('@nivo/pie').then((m) => m.ResponsivePie), {
  ssr: false,
});

interface PieDataProps {
  data: AggregatedDataType[];
}

export function PieChart({data}: PieDataProps) {
  return (
    <ResponsivePie
      data={data}
      valueFormat={(value) => formatTimeDuration(value)}
      margin={{top: 40, right: 210, bottom: 80, left: 80}}
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
          anchor: 'top-right',
          direction: 'column',
          justify: false,
          itemsSpacing: 0,
          translateX: 160,
          translateY: 0,
          itemWidth: 100,
          itemHeight: 20,
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
  );
}
