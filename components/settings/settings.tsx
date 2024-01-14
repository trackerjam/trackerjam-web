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

  return (
    <div>
      {error && <ErrorDetails error={error} />}
      {isLoading && <Spinner />}

      <PaymentResult />

      {Boolean(data) && (
        <>
          <SubscriptionStatus hasSubscription={data?.hasSubscription} />
          {Boolean(!data?.hasSubscription) && <CheckoutButton />}
          {Boolean(data?.hasSubscription) && <ManageButton />}
        </>
      )}
    </div>
  );
}
