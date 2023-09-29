import dynamic from 'next/dynamic';
import {useMemo} from 'react';
import {getBestTag} from '../../utils/best-tag';
import {TAG} from '../../utils/classification/tags';
import {MemberStatisticActivityType} from '../../types/api';

// Read more about this import issue: https://github.com/plouc/nivo/issues/2310
const ResponsiveRadar = dynamic(() => import('@nivo/radar').then((m) => m.ResponsiveRadar), {
  ssr: false,
});

interface RadarDataProps {
  data: MemberStatisticActivityType[] | null | undefined;
}

const KEEP_TOP_TAGS = 5;

export function RadarChart({data}: RadarDataProps) {
  const chartData = useMemo(() => {
    if (data) {
      const aggregated = data.reduce(
        (acc, {domainsTags, timeSpent}) => {
          const bestTag = getBestTag(domainsTags ?? {});
          if (domainsTags) {
            if (!acc[bestTag]) {
              acc[bestTag] = 0;
            }
            // Make Other less dominant by -20%
            const sumValue = bestTag === TAG.Other ? timeSpent * 0.8 : timeSpent;

            acc[bestTag] = acc[bestTag] + sumValue;
          }
          return acc;
        },
        {} as Record<string, number>
      );

      // Convert the aggregated data into an array and sort by value (in descending order)
      const sortedData = Object.keys(aggregated)
        .map((key) => ({id: key, value: aggregated[key]}))
        .sort((a, b) => b.value - a.value);

      return sortedData.slice(0, KEEP_TOP_TAGS);
    }
    return [];
  }, [data]);

  return (
    <ResponsiveRadar
      data={chartData}
      keys={['value']}
      indexBy="id"
      valueFormat=">-.1f"
      margin={{top: 60, right: 60, bottom: 60, left: 60}}
      gridLabelOffset={36}
      dotSize={8}
      dotColor={{theme: 'background'}}
      dotBorderWidth={1}
      colors={{scheme: 'nivo'}}
      blendMode="multiply"
      motionConfig="default"
      isInteractive={false}
      legends={[]}
    />
  );
}
