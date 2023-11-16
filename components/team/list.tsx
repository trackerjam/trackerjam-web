'use client';

import {useEffect, useState} from 'react';
import {BsPlusCircle} from 'react-icons/bs';
import {useParams, useRouter} from 'next/navigation';
import {useLocalStorage} from 'usehooks-ts';
import {useGetData} from '../hooks/use-get-data';
import {ErrorDetails} from '../common/error-details';
import {GetTeamResponse} from '../../types/api';
import {Button} from '../common/button';
import {WELCOME_URL_HASH} from '../../const/url';
import {ListSkeleton} from './list-skeleton';
import {MemberCard} from './member-card';
import {WelcomeModal} from './welcome-modal';

export const GRID_TEMPLATE = 'repeat(auto-fit, minmax(250px, 350px))';

export function Team() {
  const {data, isLoading, error, update} = useGetData<GetTeamResponse>('/api/team');
  const [haveSeenWelcomeModal, setHaveSeenWelcomeModal] = useLocalStorage(
    'have-seen-welcome-modal',
    false
  );
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const router = useRouter();
  const params = useParams();
  const teamData = data?.[0]?.members || [];

  useEffect(() => {
    if (!haveSeenWelcomeModal || window.location.hash === WELCOME_URL_HASH) {
      setShowWelcomeModal(true);
      const uri = window.location.toString();
      const cleanUri = uri.substring(0, uri.indexOf('#'));
      router.replace(cleanUri);
    }
  }, [haveSeenWelcomeModal, params, router]);

  const addMemberClickHandler = () => {
    router.push('/team/add-member');
  };

  const handleCardDelete = () => {
    update();
  };

  const closeWelcomeModal = () => {
    setHaveSeenWelcomeModal(true);
    setShowWelcomeModal(false);
  };

  return (
    <>
      {error && <ErrorDetails error={error} />}

      <WelcomeModal isOpen={showWelcomeModal} onClose={closeWelcomeModal} />

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
