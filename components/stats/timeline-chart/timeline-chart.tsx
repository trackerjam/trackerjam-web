import {useMemo, useState} from 'react';
import dynamic from 'next/dynamic';
import {useStyletron} from 'baseui';
import {Checkbox} from 'baseui/checkbox';
import {MemberStatisticActivityType} from '../../../types/api';
import {OTHER_BUCKET_STR} from '../../../const/string';
import {getHourlyData, TOTAL_KEY} from './get-hourly-data';
import {getDomainNamesFromData} from './get-domain-names-from-data';
import {TimeLineTooltip} from './tooltip';

const ResponsiveBar = dynamic(() => import('@nivo/bar').then((m) => m.ResponsiveBar), {
  ssr: false,
});

interface TimelineChartProps {
  data: MemberStatisticActivityType[] | null | undefined;
  focusedDomainId?: string | null;
}

export function TimelineChart({data, focusedDomainId}: TimelineChartProps) {
  const [isDetailsEnabled, setIsDetailsEnabled] = useState<boolean>(false);
  const [css, theme] = useStyletron();

  const wrapperStyle = css({
    borderRadius: theme.borders.radius300,
    marginTop: theme.sizing.scale600,
    ...theme.borders.border200,
  });

  const timelineChartStyle = css({
    height: '300px',
  });

  const chartSettingsStyle = css({
    padding: theme.sizing.scale600,
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '-36px',
  });

  const {chartData = [], domains = []} = useMemo(() => {
    if (data?.length) {
      let filteredData = data;
      if (focusedDomainId) {
        filteredData = data.filter((d) => d.domainName === focusedDomainId);
      }
      const chartData = getHourlyData(filteredData);
      const domains = getDomainNamesFromData(chartData);

      return {
        chartData,
        domains,
      };
    }
    return {};
  }, [data, focusedDomainId]);

  const chartKeys = isDetailsEnabled ? domains : [TOTAL_KEY];

  return (
    <div className={wrapperStyle}>
      <h3 className="mt-4 ml-4 text-gray-600 text-12 font-bold">Activity Timeline</h3>

      <div className={chartSettingsStyle}>
        <Checkbox
          checked={isDetailsEnabled}
          onChange={(e) => setIsDetailsEnabled(e.target.checked)}
        >
          Domain details
        </Checkbox>
      </div>

      <div className={timelineChartStyle}>
        <ResponsiveBar
          data={chartData}
          keys={chartKeys}
          indexBy="id"
          label={(d) => d?.value?.toFixed(1) || ''}
          valueFormat="0.1f"
          margin={{top: 20, right: 50, bottom: 50, left: 70}}
          colors={{scheme: 'set2'}}
          padding={0.3}
          valueScale={{type: 'linear'}}
          indexScale={{type: 'band', round: true}}
          axisTop={null}
          axisRight={null}
          groupMode="stacked"
          maxValue={60}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'UTC Hour',
            legendPosition: 'middle',
            legendOffset: 32,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Activity in minutes',
            legendPosition: 'middle',
            legendOffset: -40,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 1.6]],
          }}
          role="application"
          defs={[
            {
              id: 'dots',
              type: 'patternDots',
              background: 'inherit',
              color: '#38bcb2',
              size: 4,
              padding: 1,
              stagger: true,
            },
          ]}
          fill={[
            {
              match: {
                id: OTHER_BUCKET_STR,
              },
              id: 'dots',
            },
          ]}
          theme={{
            grid: {
              line: {
                stroke: '#eee',
                strokeWidth: 1,
                // strokeDasharray: '14 4',
              },
            },
          }}
          tooltip={({data, id, formattedValue}) => {
            if (isDetailsEnabled) {
              return (
                <span className="border-2 shadow bg-white p-2">
                  {id} - {formattedValue} min
                </span>
              );
            }
            return <TimeLineTooltip data={data} domains={domains} />;
          }}
        />
      </div>
    </div>
  );
}
