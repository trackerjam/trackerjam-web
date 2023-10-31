import {Metadata} from 'next';
import {MemberStatistics} from '../../../../components/stats/member-statistics';

export const metadata: Metadata = {
  title: 'Member statistics - Trackerjam',
};

export default async function StatisticsMemberPage({params}: {params: {memberId: string}}) {
  return <MemberStatistics memberId={params.memberId} />;
}
