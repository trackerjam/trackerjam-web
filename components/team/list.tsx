'use client';

import {useEffect, useState} from 'react';
import {BsPlusCircle} from 'react-icons/bs';
import {useParams, useRouter} from 'next/navigation';
import {useLocalStorage} from 'usehooks-ts';
import {useTrackEvent} from '../hooks/use-track-event';
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
  const trackEvent = useTrackEvent();
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
    trackEvent('click-add-member-main-button');
    router.push('/team/add-member');
  };

  const addFirstMemberClickHandler = () => {
    trackEvent('click-add-first-member-button');
    router.push('/team/add-member');
  };

  const handleCardDelete = () => {
    update();
  };

  const closeWelcomeModal = () => {
    setHaveSeenWelcomeModal(true);
    setShowWelcomeModal(false);
  };

  const hasAddFirstButton = !isLoading && teamData.length === 0;

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
          {hasAddFirstButton && (
            <div
              className="relative flex min-h-[300px] flex-col gap-4 rounded-lg shadow border border-black border-opacity-[0.08] items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={addFirstMemberClickHandler}
            >
              <span className="text-20 font-bold text-gray-500">Add first team member</span>
              <span>
                <BsPlusCircle size={36} title="" className="text-gray-500" />
              </span>
            </div>
          )}
          {teamData?.map((userData) => {
            return <MemberCard key={userData.id} data={userData} onDelete={handleCardDelete} />;
          })}
        </div>
      )}
    </>
  );
}
