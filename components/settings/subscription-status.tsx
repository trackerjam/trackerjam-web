import {PRICING_URL} from '../../const/url';

interface SubscriptionStatusProps {
  hasSubscription: boolean | undefined;
}
export const SubscriptionStatus = ({hasSubscription}: SubscriptionStatusProps) => {
  return (
    <div>
      <div className="mb-6">
        {!hasSubscription && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 mt-2">
            <p className="font-bold">You have no active subscription</p>
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
