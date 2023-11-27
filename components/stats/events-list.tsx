import {MemberEvent} from '@prisma/client';
import {format, formatDistanceToNowStrict} from 'date-fns';

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

const groupEventsByDate = (events: MemberEvent[]) => {
  const groupedEvents: {
    [dateStr: string]: MemberEvent[];
  } = {};

  events.forEach((event) => {
    const eventDate = format(new Date(event.date), 'dd MMMM, yyyy');
    if (!groupedEvents[eventDate]) {
      groupedEvents[eventDate] = [];
    }
    groupedEvents[eventDate].push(event);
  });

  return groupedEvents;
};

export function EventsList({events}: EventsListProps) {
  const groupedEvents = groupEventsByDate(events);

  return (
    <div>
      <div className="text-gray-500 mb-2 text-12">Displayed in local browser time</div>

      {Object.keys(groupedEvents).map((date) => (
        <div key={date}>
          <h3 className="py-1 bg-blue-100 px-2 mb-2 rounded-md text-16 font-bold">{date}</h3>
          {groupedEvents[date].map((eventRecord) => {
            const readableText = STATUS_TEXT[eventRecord.event] ?? eventRecord.event;

            return (
              <div key={eventRecord.id} className="p-2 border border-gray-200 rounded-md mb-2">
                <i className="mb-3 inline-flex">{readableText}</i>
                <div className="text-gray-500 text-14">
                  {new Date(eventRecord.date).toLocaleTimeString()}{' '}
                  <span className="text-gray-400">
                    ({formatDistanceToNowStrict(new Date(eventRecord.date), {addSuffix: true})})
                  </span>
                </div>
                {Boolean(eventRecord.ipAddress) && (
                  <div className="text-gray-300 text-14">From IP {eventRecord.ipAddress}</div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
