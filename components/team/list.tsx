'use client';

import {useMemo} from 'react';
import {BsPlusCircle} from 'react-icons/bs';
import {useRouter} from 'next/navigation';

import {useGetData} from '../hooks/use-get-data';
import {DEFAULT_TEAM_NAME} from '../../const/team';
import {ErrorDetails} from '../common/error-details';
import {GetTeamResponse} from '../../types/api';
import {Button} from '../common/button';
import {ListSkeleton} from './list-skeleton';
import {MemberCard} from './member-card';

export const GRID_TEMPLATE = 'repeat(auto-fit, minmax(250px, 350px))';

export function Team() {
  const {data, isLoading, error, update} = useGetData<GetTeamResponse>('/api/team');

  const router = useRouter();

  const teamData = useMemo(() => {
    if (data) {
      // We currently support the default team only
      return data.find(({name}) => name === DEFAULT_TEAM_NAME)?.members;
    }
  }, [data]);

  const addMemberClickHandler = () => {
    router.push('/team/add-member');
  };

  const handleCardDelete = () => {
    update();
  };

  return (
    <>
      {error && <ErrorDetails error={error} />}

      <div className="flex justify-end mb-4">
        <Button onClick={addMemberClickHandler} type="button" kind="primary">
          <BsPlusCircle className="mr-3" />
          Add member
        </Button>
      </div>

      {isLoading && <ListSkeleton />}
      {!isLoading && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,350px))] gap-5 mb-7">
          {teamData?.map((userData) => {
            return <MemberCard key={userData.id} data={userData} onDelete={handleCardDelete} />;
          })}
        </div>
      )}
    </>
  );
}
