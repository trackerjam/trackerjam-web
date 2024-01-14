import {useSendData} from '../hooks/use-send-data';
import {StripeUrl} from '../../types/api';
import {ErrorDetails} from '../common/error-details';
import {Button} from '../common/button';

export function ManageButton() {
  const {send, isLoading, error} = useSendData<void, StripeUrl>('/api/stripe/manage');

  const handleManage = async () => {
    const response = await send();
    if (response && 'url' in response) {
      window.location.href = response.url;
    }
  };

  return (
    <div>
      {error && <ErrorDetails error={error} />}
      <Button isLoading={isLoading} onClick={handleManage} kind="gray">
        Manage subscription
      </Button>
    </div>
  );
}
