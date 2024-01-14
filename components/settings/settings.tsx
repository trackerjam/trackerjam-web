'use client';
import {CheckoutButton} from '../common/checkout-button';
import {useGetData} from '../hooks/use-get-data';
import {ErrorDetails} from '../common/error-details';
import {Spinner} from '../common/spinner';
import {SettingsResponse} from '../../types/api';
import {PaymentResult} from './payment-result';
import {SubscriptionStatus} from './subscription-status';
import {ManageButton} from './manage-button';

export function Settings() {
  const {data, error, isLoading} = useGetData<SettingsResponse>('/api/settings');

  const hasSubscription = Boolean(data?.hasSubscription);

  return (
    <div>
      <PaymentResult />

      {error && <ErrorDetails error={error} />}
      {isLoading && <Spinner />}

      {Boolean(data) && (
        <>
          <SubscriptionStatus hasSubscription={hasSubscription} />
          {Boolean(!hasSubscription) && <CheckoutButton />}
          {Boolean(hasSubscription) && <ManageButton />}
        </>
      )}
    </div>
  );
}
