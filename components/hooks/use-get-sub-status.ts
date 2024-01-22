import {SubscriptionStatusResponse} from '../../types/api';
import {useGetData} from './use-get-data';

interface UseGetSubStatusReturnType {
  data: SubscriptionStatusResponse | null | undefined;
  isLoading: boolean;
  error: string | null;
}
export function useGetSubStatus(): UseGetSubStatusReturnType {
  const {data, isLoading, error} = useGetData<SubscriptionStatusResponse>('/api/subs');

  return {data, isLoading, error};
}
