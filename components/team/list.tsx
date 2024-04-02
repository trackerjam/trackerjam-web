'use client';

import {useEffect, useState} from 'react';
import {BsPlusCircle} from 'react-icons/bs';
import {useRouter} from 'next/navigation';
import {PaymentStatus} from '@prisma/client';
import {useTrackEvent} from '../hooks/use-track-event';
import {useGetData} from '../hooks/use-get-data';
import {ErrorDetails} from '../common/error-details';
import {GetTeamResponse} from '../../types/api';
import {Button} from '../common/button';
import {useGetSubStatus} from '../hooks/use-get-sub-status';
import {useSendData} from '../hooks/use-send-data';
import {ListSkeleton} from './list-skeleton';
import {MemberCard} from './member-card';
import {WelcomeModal} from './welcome-modal';
import {SubscriptionBanners} from './sub-banners';

export const GRID_TEMPLATE = 'repeat(auto-fit, minmax(250px, 350px))';

export function Team() {
  const {data, isLoading, error, update} = useGetData<GetTeamResponse>('/api/team');
  const {data: notificationData, isLoading: isNotificationLoading} = useGetData<{welcome: string}>(
    '/api/notifications'
  );
  const {send: setNotification} = useSendData('/api/notifications');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const {data: subsStatus, isLoading: isSubsLoading} = useGetSubStatus();
  const router = useRouter();
  const trackEvent = useTrackEvent();

  const teamData = data?.[0]?.members || [];

  useEffect(() => {
    (async () => {
      const showWelcome = Boolean(!notificationData?.welcome && !isNotificationLoading);
      if (showWelcome) {
        setShowWelcomeModal(true);
        await setNotification({name: 'welcome'}, 'PUT');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationData]);

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
    setShowWelcomeModal(false);
  };

  const hasAddFirstButton = !isLoading && teamData.length === 0;

  const canAddMember = !isSubsLoading && subsStatus?.canAddMember;
  const hasNoSubs = !isSubsLoading && subsStatus?.status !== PaymentStatus.ACTIVE;

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

      <SubscriptionBanners subsStatus={subsStatus} isSubsLoading={isSubsLoading} />

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
            return (
              <MemberCard
                key={userData.id}
                data={userData}
                hasNoSubscription={hasNoSubs}
                onDelete={handleCardDelete}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
