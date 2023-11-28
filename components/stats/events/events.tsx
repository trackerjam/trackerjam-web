import {MemberEvent} from '.prisma/client';
import {EventsList} from '../events-list';
import {useGetData} from '../../hooks/use-get-data';
import {ErrorDetails} from '../../common/error-details';
import {Spinner} from '../../common/spinner';

interface EventProps {
  memberId: string | undefined | null;
}

export function Events({memberId}: EventProps) {
  const {data, isLoading, error} = useGetData<MemberEvent[]>(`/api/events/${memberId}`);

  return (
    <div>
      <h2 className="text-24 font-bold mb-4">Events</h2>
      {Boolean(isLoading) && <Spinner />}
      {error && <ErrorDetails error={error} />}
      {Boolean(data) && <EventsList events={data ?? []} />}
    </div>
  );
}
