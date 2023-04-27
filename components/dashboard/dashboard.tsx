import Head from 'next/head';
import {HeadingMedium as Title} from 'baseui/typography';
import {MessageCard} from 'baseui/message-card';
import {FlexGrid, FlexGridItem} from 'baseui/flex-grid';
import {useRouter} from 'next/router';
import {useGetData} from '../hooks/use-get-data';
import type {DashboardResponse} from '../../types/api';
import {ErrorDetails} from '../common/error-details';
import {DashboardSkeleton} from './skeleton';

export function Dashboard() {
  const router = useRouter();
  const {data, isLoading, error} = useGetData<DashboardResponse>('/api/dashboard');

  const {membersCount} = data || {};

  return (
    <div>
      <Head>
        <title>Dashboard</title>
      </Head>
      <Title marginBottom="scale600" marginTop="0">
        Dashboard
      </Title>

      {isLoading && <DashboardSkeleton />}

      {error && <ErrorDetails error={error} />}

      {!isLoading && (
        <FlexGrid
          flexGridColumnCount={[1, 1, 3, 4]}
          flexGridColumnGap="scale800"
          flexGridRowGap="scale800"
        >
          <FlexGridItem>
            <MessageCard
              heading={`${membersCount} team member${membersCount > 1 ? 's' : ''}`}
              buttonLabel="Go to Team"
              onClick={async () => await router.push('/team')}
            />
          </FlexGridItem>
        </FlexGrid>
      )}
    </div>
  );
}
