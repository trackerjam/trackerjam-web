'use client';
import {useRouter} from 'next/navigation';
import {useGetData} from '../hooks/use-get-data';
import type {DashboardResponse} from '../../types/api';
import {ErrorDetails} from '../common/error-details';
import {DashboardSkeleton} from './skeleton';

export function Dashboard() {
  const router = useRouter();
  const {data, isLoading, error} = useGetData<DashboardResponse>('/api/dashboard');

  const {membersCount} = data || {};
  const showTeamMembers = typeof membersCount === 'number';
  const membersCountActionName = membersCount === 0 ? 'Add member' : 'Go to team';

  const handleTeamMembersClick = async () => {
    await router.push(membersCount === 0 ? '/team/add-member' : '/team');
  };

  return (
    <>
      {isLoading && <DashboardSkeleton />}

      {error && <ErrorDetails error={error} />}

      {!isLoading && (
        <div className="">
          {showTeamMembers && (
            <button
              className="p-4 pr-2 border-2 flex flex-col w-[230px] rounded-xl border-gray-90"
              onClick={handleTeamMembersClick}
            >
              <h3 className="text-20 leading-tight font-bold">
                {membersCount} team member{membersCount === 1 ? '' : 's'}
              </h3>
              <span className="py-2.5 px-3 mt-3 text-14 leading-none font-medium bg-gray-80 rounded-[30px]">
                {membersCountActionName}
              </span>
            </button>
          )}
        </div>
      )}
    </>
  );
}
