import {MemberEvent} from '@prisma/client';
import {formatDistanceToNowStrict} from 'date-fns';

interface EventsListProps {
  events: MemberEvent[];
}

// See https://github.com/Deliaz/trackerjam-extension/blob/main/src/types/userEvent.ts
const STATUS_TEXT: {[key: string]: string} = {
  Auth: 'User activated the key',
  Logout: 'User signed out from the extension',
  EnabledExtension: 'Extension is enabled',
  PausedTracker: 'Tracking has been paused',
  StartedTracker: 'Tracking has been started',
};
export function EventsList({events}: EventsListProps) {
  return (
    <div>
      <h2 className="text-24 font-bold mb-4">Events</h2>
      <div className="text-gray-500 mb-2">Most recent shown at the top</div>

      {events?.map((eventRecord) => {
        const dateObj = new Date(eventRecord.date);
        const readableText: string = STATUS_TEXT[eventRecord.event] ?? eventRecord.event;

        return (
          <div key={eventRecord.id} className="p-4 border border-gray-300 rounded-md mb-2">
            <strong>{readableText}</strong>
            <div className="text-gray-500">
              {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString()}{' '}
              <span className="text-gray-400">
                ({formatDistanceToNowStrict(dateObj, {addSuffix: true})})
              </span>
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
