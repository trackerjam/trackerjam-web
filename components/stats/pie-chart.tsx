import dynamic from 'next/dynamic';
import {useMemo} from 'react';
import {formatTimeDuration} from '../../utils/format-time-duration';
import {OTHER_BUCKET_STR} from '../../const/string';
import {AggregatedDataType} from './types';
import {createOtherBucket} from './utils/create-other-bucket';

// Read more about this import issue: https://github.com/plouc/nivo/issues/2310
const ResponsivePie = dynamic(() => import('@nivo/pie').then((m) => m.ResponsivePie), {
  ssr: false,
});

interface PieDataProps {
  data: AggregatedDataType[];
  hoveredId?: null | string;
  onHover: (domainId: string | null) => void;
}

function truncateLongLabels(label: string) {
  const LIMIT = 20;
  if (label.length > LIMIT) {
    return label.slice(0, LIMIT) + '...';
  }
  return label;
}

export function PieChart({data, hoveredId, onHover}: PieDataProps) {
  const dataWithOther = useMemo(() => {
    return createOtherBucket(data);
  }, [data]);

  const hoveredBucketId = useMemo(() => {
    if (hoveredId) {
      const isTopDomain = dataWithOther.some(({id}) => id === hoveredId);
      return isTopDomain ? hoveredId : OTHER_BUCKET_STR;
    }
    return hoveredId;
  }, [dataWithOther, hoveredId]);

  return (
    <ResponsivePie
      data={dataWithOther}
      valueFormat={(value) => formatTimeDuration(value)}
      margin={{top: 40, right: 80, bottom: 80, left: 80}}
      colors={{scheme: 'set2'}}
      id="label"
      arcLinkLabel={({label}) => {
        return truncateLongLabels(label as string);
      }}
      innerRadius={0.3}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={1}
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
      arcLinkLabelsDiagonalLength={8}
      arcLinkLabelsStraightLength={12}
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
            id: hoveredBucketId,
          },
          id: 'dots',
        },
      ]}
    />
  );
}
