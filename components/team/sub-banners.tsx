import {PaymentStatus} from '@prisma/client';
import React from 'react';
import {PRICING_URL, SUPPORT_EMAIL} from '../../const/url';
import {SubscriptionStatusResponse} from '../../types/api';
import {Banner} from '../common/banner';

type SubscriptionBannersProps = {
  subsStatus: SubscriptionStatusResponse | null | undefined;
  isSubsLoading: boolean;
};

export const ReachedLimitMessage = () => {
  return (
    <>
      <p className="font-bold">You have reached the limit of members</p>
      <p>You can add more members to your team by upgrading your subscription. </p>
    </>
  );
};

export const NoSubsMessage = () => {
  return (
    <>
      <p className="font-bold">You have no active subscription</p>
      <p>You can start adding members by upgrading your subscription. </p>
    </>
  );
};

export const ContactForTrialExtension = () => {
  return (
    <p className="mt-4 mb-1">
      <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
        Contact us
      </a>{' '}
      if you need more time for the trial period.
    </p>
  );
};

export function SubscriptionBanners({subsStatus, isSubsLoading}: SubscriptionBannersProps) {
  const hasReachedLimit =
    !isSubsLoading && !subsStatus?.canAddMember && subsStatus?.status === PaymentStatus.ACTIVE;
  const hasNoSubs = !isSubsLoading && subsStatus?.status !== PaymentStatus.ACTIVE;
  const hasTrial = !isSubsLoading && subsStatus?.hasTrial;

  return (
    <>
      {(hasReachedLimit || hasNoSubs) && (
        <Banner type="info">
          {hasReachedLimit && <ReachedLimitMessage />}
          {hasNoSubs && <NoSubsMessage />}
          <ContactForTrialExtension />

          <a
            href={PRICING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 border border-solid border-yellow-800 p-2 rounded-lg bg-yellow-50 hover:bg-green-200 hover:text-green-800 transition-colors"
          >
            Upgrade plan
          </a>
        </Banner>
      )}

      {hasTrial && (
        <Banner type="info">
          <p className="font-bold">You are on a trial period</p>
          <p className="text-14 text-blue-500">
            Enjoy all the features of TrackerJam for free.
            <br /> Do not forget to upgrade your plan before the trial ends on{' '}
            <span className="font-bold">{subsStatus?.trialEndsAt}</span>.
          </p>
          <a
            href={PRICING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 border border-solid border-blue-800 p-2 rounded-lg bg-blue-50 hover:bg-green-200 hover:text-green-800 transition-colors"
          >
            Upgrade plan
          </a>
        </Banner>
      )}
    </>
  );
}
