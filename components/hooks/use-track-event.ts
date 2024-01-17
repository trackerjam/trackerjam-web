import {usePlausible} from 'next-plausible';
import {useSession} from 'next-auth/react';
import {shortenUUID} from '../../utils/shorten-uuid';

export function useTrackEvent() {
  const plausible = usePlausible();
  const {data: session} = useSession();

  return (eventName: string, ...params: unknown[]) => {
    const usedId = session?.user?.id || '<unknown>';
    const shortId = shortenUUID(usedId);

    plausible(eventName, {
      props: {
        userId: shortId,
        ...params,
      },
    });
  };
}
