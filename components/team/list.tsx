'use client';

import {useEffect, useState} from 'react';
import {BsPlusCircle} from 'react-icons/bs';
import {useParams, useRouter} from 'next/navigation';
import {useLocalStorage} from 'usehooks-ts';
import {PaymentStatus} from '@prisma/client';
import {useTrackEvent} from '../hooks/use-track-event';
import {useGetData} from '../hooks/use-get-data';
import {ErrorDetails} from '../common/error-details';
import {GetTeamResponse} from '../../types/api';
import {Button} from '../common/button';
import {PRICING_URL, WELCOME_URL_HASH} from '../../const/url';
import {useGetSubStatus} from '../hooks/use-get-sub-status';
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
  const {data: subsStatus, isLoading: isSubsLoading} = useGetSubStatus();
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

  const canAddMember = !isSubsLoading && subsStatus?.canAddMember;
  const hasReachedLimit =
    !isSubsLoading && !subsStatus?.canAddMember && subsStatus?.status === PaymentStatus.ACTIVE;
  const hasNoSubs = !isSubsLoading && subsStatus?.status !== PaymentStatus.ACTIVE;
  const hasTrial = !isSubsLoading && subsStatus?.hasTrial;

  return (
    <>
      {error && <ErrorDetails error={error} />}

      <WelcomeModal isOpen={showWelcomeModal} onClose={closeWelcomeModal} />

      <div className="flex justify-between items-center mb-2">
        <p className="mt-2 text-14 font-medium">List of your team members & contractors</p>

        <div className="flex justify-end">
          <Button
            onClick={addMemberClickHandler}
            type="button"
            kind="primary"
            disabled={!canAddMember}
          >
            <BsPlusCircle className="mr-3" />
            Add member
          </Button>
        </div>
      </div>

      {(hasReachedLimit || hasNoSubs) && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 mt-2">
          {hasReachedLimit && (
            <>
              <p className="font-bold">You have reached the limit of members</p>
              <p>You can add more members to your team by upgrading your subscription. </p>
            </>
          )}

          {hasNoSubs && (
            <>
              <p className="font-bold">You have no active subscription</p>
              <p>You can start adding members by upgrading your subscription. </p>
            </>
          )}

          <a
            href={PRICING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 border border-solid border-yellow-800 p-2 rounded-lg bg-yellow-50 hover:bg-green-200 hover:text-green-800 transition-colors"
          >
            Upgrade plan
          </a>
        </div>
      )}

      {hasTrial && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 mt-2">
          <p className="font-bold">You are on a trial period</p>
          <p>
            You can add more members to your team by upgrading your subscription before the trial
            ends.
          </p>
          <p>
            Trial ends on <span className="font-bold">{subsStatus?.trialEndsAt}</span>
          </p>
          <a
            href={PRICING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 border border-solid border-blue-800 p-2 rounded-lg bg-blue-50 hover:bg-green-200 hover:text-green-800 transition-colors"
          >
            Upgrade plan
          </a>
        </div>
      )}

      {isLoading && <ListSkeleton />}
      {!isLoading && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,350px))] gap-5 mb-7">
          {hasAddFirstButton && subsStatus?.canAddMember && (
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
