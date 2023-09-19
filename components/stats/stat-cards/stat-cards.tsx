import {useMemo} from 'react';
import {DateActivityData} from '../../../types/api';
import {formatTimeDuration} from '../../../utils/format-time-duration';
import {SingleCard} from './single-card';
import {countUniqueDomains} from './count-unique-domains';
import {calcHttpsPercentage} from './calc-https-percentage';
import {getDomainWithLongestSession} from './get-domain-with-logest-sessions';
import {getStatDelta} from './get-stat-delta';

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
        value: formatTimeDuration(data.totalActivityTime),
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
    };
  }, [data, previousDayData]);
}
export function StatCards({data, previousDayData}: StatCardProps) {
  const {activityTime, sessionCount, totalDomainsCount, httpsPercentage, mostVisitedDomain} =
    useStatData(data, previousDayData);

  return (
    <div className="flex gap-8 mt-4">
      <SingleCard stat={activityTime} title="Activity Time" />
      <SingleCard stat={mostVisitedDomain} title="Most Time Spent On" />
      <SingleCard stat={totalDomainsCount} title="Domains Count" />
      <SingleCard stat={sessionCount} title="Session Count" />
      <SingleCard stat={httpsPercentage} title="HTTPS Percentage" />
    </div>
  );
}
