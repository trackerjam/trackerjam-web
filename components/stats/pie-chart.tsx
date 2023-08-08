import dynamic from 'next/dynamic';
import {formatTimeDuration} from '../../utils/format-time-duration';
import {getStringColor} from '../../utils/get-string-color';
import {AggregatedDataType} from './types';

// Read more about this import issue: https://github.com/plouc/nivo/issues/2310
const ResponsivePie = dynamic(() => import('@nivo/pie').then((m) => m.ResponsivePie), {
  ssr: false,
});

interface PieDataProps {
  data: AggregatedDataType[];
  hoveredId?: null | string;
  onHover: (domainId: string | null) => void;
}

export function PieChart({data, hoveredId, onHover}: PieDataProps) {
  return (
    <ResponsivePie
      data={data}
      valueFormat={(value) => formatTimeDuration(value)}
      margin={{top: 40, right: 80, bottom: 80, left: 80}}
      colors={(datum) => getStringColor(datum.id as string)}
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
      onMouseEnter={({id}) => onHover(id as string)}
      onMouseLeave={() => onHover(null)}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor="#333333"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{from: 'color'}}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{
        from: 'color',
        modifiers: [['darker', 2]],
      }}
      defs={[
        {
          id: 'dots',
          type: 'patternLines',
          background: 'inherit',
          color: 'rgba(255, 255, 255, 0.4)',
          size: 4,
          padding: 1,
          stagger: true,
        },
      ]}
      fill={[
        {
          match: {
            id: hoveredId,
          },
          id: 'dots',
        },
      ]}
    />
  );
}
