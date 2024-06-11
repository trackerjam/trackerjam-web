import {PaymentStatus} from '@prisma/client';
import {SubscriptionStatusResponse} from '../../types/api';
import {useGetData} from './use-get-data';

export interface UseGetSubStatusReturnType {
  data: SubscriptionStatusResponse | null | undefined;
  isLoading: boolean;
  error: string | null;
  hasAnySub: boolean | null | undefined;
  hasActiveSub: boolean | null | undefined;
}
export function useGetSubStatus(): UseGetSubStatusReturnType {
  const {data, isLoading, error} = useGetData<SubscriptionStatusResponse>('/api/subs');

  const hasActiveStatus = data?.status === PaymentStatus.ACTIVE;
  const hasTrial = data?.hasTrial;
  const hasAnySub = hasActiveStatus || hasTrial;
  const hasActiveSub = hasActiveStatus && !hasTrial;

  return {data, isLoading, error, hasAnySub, hasActiveSub};
}
