import {PRICING_URL} from '../../const/url';

interface SubscriptionStatusProps {
  hasSubscription: boolean | undefined;
}
export const SubscriptionStatus = ({hasSubscription}: SubscriptionStatusProps) => {
  return (
    <div>
      <div className="mb-6">
        {!hasSubscription && (
          <>
            <div className="mt-2 p-6 border border-2 border-amber-500 border-dashed rounded-sm bg-amber-50">
              Please choose you subscription plan from the{' '}
              <a href={PRICING_URL} className="underline text-blue-700 font-bold">
                Pricing page
              </a>
              .
            </div>
            <div className="text-16 text-gray-500 italic mt-4">
              You don&apos;t have an active subscription.
            </div>
          </>
        )}

        {hasSubscription && (
          <>
            <div className="text-16 font-semibold">
              You subscription is <span className="font-bold text-lime-700">Active</span>.
            </div>
          </>
        )}
      </div>
    </div>
  );
};
