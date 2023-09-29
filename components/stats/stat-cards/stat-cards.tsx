import {useMemo} from 'react';
import {DateActivityData} from '../../../types/api';
import {formatTimeDuration} from '../../../utils/format-time-duration';
import {SingleValue} from './single-value';
import {countUniqueDomains} from './count-unique-domains';
import {calcHttpsPercentage} from './calc-https-percentage';
import {getDomainWithLongestSession} from './get-domain-with-logest-sessions';
import {getStatDelta} from './get-stat-delta';
import {calcProductivityPercentages} from './calc-productivity-stat';
import {ProductivityBar} from './productivity-bar';

type ActivityDataType = DateActivityData | null | undefined;
interface StatCardProps {
  data: ActivityDataType;
  previousDayData: ActivityDataType;
}

export enum DELTA_INCLINE {
  POSITIVE,
  NEGATIVE,
  SAME,
}

function useStatData(data: ActivityDataType, previousDayData: ActivityDataType) {
  return useMemo(() => {
    if (!data) {
      return {};
    }

    const sessionCountNumber = data.activities.reduce(
      (acc, {activitiesCount}) => acc + activitiesCount,
      0
    );
    const prevSessionCountNumber = previousDayData?.activities.reduce(
      (acc, {activitiesCount}) => acc + activitiesCount,
      0
    );

    const totalDomainsCountNumber = countUniqueDomains(data.activities);
    const prevTotalDomainsCountNumber =
      previousDayData?.activities && countUniqueDomains(previousDayData.activities);

    const httpsPercentageNumber = calcHttpsPercentage(data.activities);
    const prevHttpsPercentageNumber =
      previousDayData?.activities && calcHttpsPercentage(previousDayData.activities);

    return {
      activityTime: {
        value: formatTimeDuration(data.totalActivityTime, {skipSeconds: true}),
        ...getStatDelta({
          value: data.totalActivityTime,
          prevValue: previousDayData?.totalActivityTime,
          type: 'percentage',
        }),
      },
      sessionCount: {
        value: sessionCountNumber,
        ...getStatDelta({
          value: sessionCountNumber,
          prevValue: prevSessionCountNumber,
        }),
      },
      totalDomainsCount: {
        value: totalDomainsCountNumber,
        ...getStatDelta({
          value: totalDomainsCountNumber,
          prevValue: prevTotalDomainsCountNumber,
        }),
      },
      httpsPercentage: {
        value: httpsPercentageNumber + '%',
        ...getStatDelta({
          value: httpsPercentageNumber,
          prevValue: prevHttpsPercentageNumber,
          type: 'percentage',
        }),
      },
      mostVisitedDomain: {
        value: getDomainWithLongestSession(data.activities),
      },
      productivityScore: {
        value: calcProductivityPercentages(data.activities),
      },
    };
  }, [data, previousDayData]);
}
export function StatCards({data, previousDayData}: StatCardProps) {
  const {
    activityTime,
    sessionCount,
    totalDomainsCount,
    httpsPercentage,
    mostVisitedDomain,
    productivityScore,
  } = useStatData(data, previousDayData);

  return (
    <div className="flex gap-4 mt-4">
      <SingleValue stat={activityTime} title="Activity Time" />
      <SingleValue stat={mostVisitedDomain} title="Most Time Spent On" />
      <SingleValue stat={totalDomainsCount} title="Domains Count" />
      <SingleValue stat={sessionCount} title="Session Count" />
      <SingleValue stat={httpsPercentage} title="HTTPS Percentage" />
      <ProductivityBar stat={productivityScore} />
    </div>
  );
}
