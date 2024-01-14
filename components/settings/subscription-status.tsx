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
            <div className="text-16 font-semibold">You don&apos;t have an active subscription.</div>
            <div className="mt-2">
              Activate your subscription to get access to analytical features.{' '}
              <a href={PRICING_URL} className="underline">
                Pricing
              </a>
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
