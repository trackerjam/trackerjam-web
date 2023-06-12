import Head from 'next/head';
import {LabelLarge as Title, LabelSmall as Subtitle} from 'baseui/typography';
import {useRouter} from 'next/router';
import dynamic from 'next/dynamic';
import {useMemo} from 'react';
import {useStyletron} from 'baseui';
import {useGetData} from '../hooks/use-get-data';
import {ErrorDetails} from '../common/error-details';
import {MemberStatisticType} from '../../types/api';
import {formatTimeDuration} from '../../utils/format-time-duration';

// Read more about this import issue: https://github.com/plouc/nivo/issues/2310
const ResponsivePie = dynamic(() => import('@nivo/pie').then((m) => m.ResponsivePie), {
  ssr: false,
});

export function MemberStatistics() {
  const [css] = useStyletron();
  const {
    query: {memberId},
  } = useRouter();
  const {data, isLoading, error} = useGetData<MemberStatisticType>(`/api/statistic/${memberId}`);
  const hasData = Boolean(!isLoading && data);

  const pieData = useMemo(() => {
    if (data?.activities) {
      return data?.activities.map(({timeSpent, domainName}) => {
        return {
          id: domainName,
          label: domainName,
          value: timeSpent,
        };
      });
    }
    return [];
  }, [data?.activities]);

  return (
    <div>
      <Head>
        <title>Statistics</title>
      </Head>

      <Title marginBottom="scale600">Statistics</Title>

      {isLoading && <span>Loading...</span>}
      {error && <ErrorDetails error={error} />}

      {hasData && (
        <>
          <Subtitle>Statistic for {data?.member?.name}</Subtitle>

          <div className={css({width: '600px', height: '400px'})}>
            <ResponsivePie
              data={pieData}
              valueFormat={(value) => formatTimeDuration(value)}
              margin={{top: 40, right: 20, bottom: 80, left: 80}}
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
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  itemsSpacing: 0,
                  translateX: 0,
                  translateY: 60,
                  itemWidth: 100,
                  itemHeight: 18,
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
          </div>
        </>
      )}
    </div>
  );
}
