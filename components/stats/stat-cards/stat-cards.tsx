import {useMemo} from 'react';
import {DateActivityData} from '../../../types/api';
import {formatTimeDuration} from '../../../utils/format-time-duration';
import {SingleCard} from './single-card';
import {countUniqueDomains} from './count-unique-domains';
import {calcHttpsPercentage} from './calc-https-percentage';
import {getDomainWithLongestSession} from './get-domain-with-logest-sessions';

interface StatCardProps {
  data: DateActivityData | null | undefined;
}
export function StatCards({data}: StatCardProps) {
  const {
    activityTimeFormatted,
    sessionCount,
    totalDomainsCount,
    httpsPercentageFormatted,
    mostVisitedDomain,
  } = useMemo(() => {
    if (!data) {
      return {};
    }

    return {
      activityTimeFormatted: formatTimeDuration(data.totalActivityTime),
      sessionCount: data.activities.reduce((acc, {activitiesCount}) => acc + activitiesCount, 0),
      totalDomainsCount: countUniqueDomains(data.activities),
      httpsPercentageFormatted: calcHttpsPercentage(data.activities),
      mostVisitedDomain: getDomainWithLongestSession(data.activities),
    };
  }, [data]);

  return (
    <div className="flex gap-8 mt-4">
      <SingleCard value={activityTimeFormatted} title="Activity Time" />
      <SingleCard value={mostVisitedDomain} title="Most Time Spent On" />
      <SingleCard value={totalDomainsCount} title="Domains Count" />
      <SingleCard value={sessionCount} title="Session Count" />
      <SingleCard value={httpsPercentageFormatted} title="HTTPS Percentage" />
    </div>
  );
}
