import {usePlausible} from 'next-plausible';
import {useSession} from 'next-auth/react';
import {sha1} from 'js-sha1';
import {shortenUUID} from '../../utils/shorten-uuid';

// Excluded admins
const EXCLUDED_SHA1_USER_IDS: string[] = [
  '4398424aaadf12783e951e3dae8337ee8eb5dcf5',
  '46a17c807be900110c1cd68fddf484258c0eeb4e',
];

export function useTrackEvent() {
  const plausible = usePlausible();
  const {data: session} = useSession();

  return (eventName: string, ...params: unknown[]) => {
    const usedId = session?.user?.id || '<unknown>';

    const userIdSha1 = sha1(usedId);
    if (EXCLUDED_SHA1_USER_IDS.includes(userIdSha1)) {
      console.info('[Excluded Event]:', eventName, ...params);
      return;
    }

    const shortId = shortenUUID(usedId);

    plausible(eventName, {
      props: {
        userId: shortId,
        ...params,
      },
    });
  };
}
