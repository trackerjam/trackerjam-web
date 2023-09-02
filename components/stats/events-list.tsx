import {MemberEvent} from '@prisma/client';
import {formatDistanceToNowStrict} from 'date-fns';

interface EventsListProps {
  events: MemberEvent[];
}
export function EventsList({events}: EventsListProps) {
  return (
    <div>
      <h2 className="text-24 font-bold mb-4">Events</h2>
      {events?.map((eventRecord) => {
        const dateObj = new Date(eventRecord.date);
        return (
          <div key={eventRecord.id} className="p-4 border border-gray-400 rounded-md mb-1">
            <strong>{eventRecord.event}</strong>
            <div className="text-gray-500">
              {dateObj.toISOString()}{' '}
              <span className="text-gray-400">({formatDistanceToNowStrict(dateObj)})</span>
            </div>
            {Boolean(eventRecord.ipAddress) && (
              <div className="text-gray-400">From IP {eventRecord.ipAddress}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
