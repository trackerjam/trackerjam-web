import {useSendData} from './use-send-data';

export function useConfirmNotification() {
  const {send: setNotification} = useSendData('/api/notifications');
  return async (name: string) => {
    await setNotification({name}, 'PUT');
  };
}
