import {TAB_TYPE} from '@prisma/client';
import {
  CreateActivityInputInternal,
  CreateDomainActivityInput,
  CreateDomainActivityInputInternal,
  CreateSessionActivityInternalInput,
} from '../../types/api';
import {getIsoDateString} from '../get-iso-date-string';
import {extractDomain} from './extract-domain';

export function translatePayloadToInternalStructure(
  activity: CreateDomainActivityInput
): CreateDomainActivityInputInternal {
  const activitiesMap: {[key: string]: CreateActivityInputInternal} = {};

  activity.sessions.forEach((session) => {
    const domain = extractDomain(session.url);
    if (!domain) {
      throw new Error('no domain extracted');
    }

    const startDay = getIsoDateString(new Date(session.startTime));
    const endDay = getIsoDateString(new Date(session.endTime));

    if (startDay === endDay) {
      const isoSession: CreateSessionActivityInternalInput = {
        ...session,
        startTime: new Date(session.startTime).toISOString(),
        endTime: new Date(session.endTime).toISOString(),
      };
      addToActivitiesMap({domain, date: startDay, sessionToAdd: isoSession});
    } else {
      const currentStartTime = new Date(session.startTime);

      // UTC compliant end of day
      const endOfDay = new Date(
        Date.UTC(
          new Date(session.startTime).getUTCFullYear(),
          new Date(session.startTime).getUTCMonth(),
          new Date(session.startTime).getUTCDate(),
          23,
          59,
          59,
          999
        )
      );

      addToActivitiesMap({
        domain,
        date: startDay,
        sessionToAdd: {
          url: session.url,
          title: session.title,
          startTime: currentStartTime.toISOString(),
          endTime: endOfDay.toISOString(),
        },
      });

      // UTC compliant start of next day
      const startOfNextDay = new Date(
        Date.UTC(
          new Date(session.endTime).getUTCFullYear(),
          new Date(session.endTime).getUTCMonth(),
          new Date(session.endTime).getUTCDate(),
          0,
          0,
          0,
          0
        )
      );
      const endTime = new Date(session.endTime);

      addToActivitiesMap({
        domain,
        date: endDay,
        sessionToAdd: {
          url: session.url,
          title: session.title,
          startTime: startOfNextDay.toISOString(),
          endTime: endTime.toISOString(),
        },
      });
    }
  });

  return {
    token: activity.token,
    activities: Object.values(activitiesMap),
  };

  function addToActivitiesMap({
    domain,
    date,
    sessionToAdd,
  }: {
    domain: string;
    date: string;
    sessionToAdd: CreateSessionActivityInternalInput;
  }) {
    const key = `${domain}-${date}`;

    if (!activitiesMap[key]) {
      activitiesMap[key] = {
        date,
        domain,
        type: TAB_TYPE.WEBSITE,
        sessions: [],
      };
    }

    activitiesMap[key].sessions.push(sessionToAdd);
  }
}
