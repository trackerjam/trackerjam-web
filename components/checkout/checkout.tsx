'use client';
import {useSearchParams} from 'next/navigation';
import {useEffect} from 'react';
import {PRICING_URL} from '../../const/url';
import {useSendData} from '../hooks/use-send-data';
import {StripeUrl} from '../../types/api';
import {ErrorDetails} from '../common/error-details';
import {Spinner} from '../common/spinner';

export function Checkout() {
  const searchParams = useSearchParams();
  const {send, isLoading, error} = useSendData<{planId: string}, StripeUrl>('/api/stripe/checkout');
  const planId = searchParams?.get('planId');

  useEffect(() => {
    (async () => {
      if (planId) {
        const response = await send({
          planId: planId as string,
        });
        if ('url' in response) {
          window.location.href = response.url;
        }
      }
    })();
  }, [planId]);

  if (!planId) {
    return (
      <div className="text-18">
        <strong>Invalid plan ID</strong>
        <p className="mt-2">
          Please try again from the{' '}
          <a className="font-bold text-blue-700 underline" href={PRICING_URL}>
            pricing page
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && <ErrorDetails error={error} />}
      {(!error || isLoading) && <Spinner />}
    </div>
  );
}
