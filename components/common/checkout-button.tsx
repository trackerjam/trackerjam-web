import {useSendData} from '../hooks/use-send-data';
import {StripeUrl} from '../../types/api';
import {PRICE_ID} from '../../const/payment';
import {ErrorDetails} from './error-details';
import {Button} from './button';

export function CheckoutButton() {
  const {send, isLoading, error} = useSendData<{priceId: string}, StripeUrl>(
    '/api/stripe/checkout'
  );

  const handleCheckout = async () => {
    const response = await send({
      priceId: PRICE_ID,
    });
    if ('url' in response) {
      window.location.href = response.url;
    }
  };

  return (
    <div>
      {error && <ErrorDetails error={error} />}
      <Button isLoading={isLoading} onClick={handleCheckout}>
        Process to checkout
      </Button>
    </div>
  );
}
