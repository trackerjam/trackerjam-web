import {MemberEvent} from '.prisma/client';
import {EventsList} from '../events-list';
import {useGetData} from '../../hooks/use-get-data';
import {ErrorDetails} from '../../common/error-details';
import {Spinner} from '../../common/spinner';

interface EventProps {
  memberToken: string | undefined | null;
}

export function Events({memberToken}: EventProps) {
  const {data, isLoading, error} = useGetData<MemberEvent[]>(`/api/events/${memberToken}`);

  return (
    <div>
      <h2 className="text-24 font-bold mb-4">Events</h2>
      {isLoading && <Spinner />}
      {error && <ErrorDetails error={error} />}
      {Boolean(data) && <EventsList events={data ?? []} />}
    </div>
  );
}
