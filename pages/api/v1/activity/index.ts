import type {NextApiRequest, NextApiResponse} from 'next';
import extractDomain from 'extract-domain';
import {TAB_TYPE} from '.prisma/client';
import {STATUS} from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
import prismadb from '../../../../lib/prismadb';
import {getErrorMessage} from '../../../../utils/get-error-message';
import {buildError} from '../../../../utils/build-error';
import {
  CreateActivityInputInternal,
  CreateDomainActivityInput,
  CreateSessionActivityInput,
  PublicMethodContext,
} from '../../../../types/api';
import {getHourBasedDate} from '../../../../utils/api/get-time-index';
import {translatePayloadToInternalStructure} from '../../../../utils/api/translate-payload';

const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000;

async function upsertDomain(domain: string) {
  return prismadb.domain.upsert({
    where: {
      domain,
    },
    update: {},
    create: {
      domain,
    },
  });
}

async function upsertDomainActivity({
  date,
  domainId,
  activityType,
  token,
}: {
  date: Date;
  domainId: string;
  activityType: TAB_TYPE;
  token: string;
}) {
  return prismadb.domainActivity.upsert({
    where: {
      date_domainId_memberToken: {
        domainId,
        date,
        memberToken: token,
      },
    },
    update: {},
    create: {
      date,
      domainId,
      type: activityType || TAB_TYPE.WEBSITE,
      timeSpent: 0,
      activitiesCount: 0,
      memberToken: token,
    },
  });
}

/**
 * 1. **Domain Extraction:** Extract the domain from the activity URL using the `extractDomain()` function.
 *
 * 2. **Domain Upsert:** Fetch or create a record in the `domain` table for the extracted domain.
 * This is accomplished with the `upsertDomain()` function, which calls the `prisma.domain.upsert()` method.
 *
 * 3. **Date Conversion:** Convert the activity date to an hour-based index value using the `getHourBasedDate()` function.
 *
 * 4. **Domain Activity Upsert:** Fetch or create a record in the `domainActivity` table using the `upsertDomainActivity()`
 * function. This function calls the `prisma.domainActivity.upsert()` method. The record is initially empty as we need
 * to filter the incoming session data first.
 *
 * 5. **Domain Activity Check:** An error is thrown if a `domainActivityRecord` is not found.
 *
 * 6. **Fetch Last Session:** Retrieve the most recent session activity for the `domainActivity` record using the
 * `prisma.sessionActivity.findFirst()` method.
 *
 * 7. **Last Session End Time:** Obtain the end time of the last session. If no previous session exists,
 * a default value of 0 is used.
 *
 * 8. **Session Filtering:** For each session in the activity, check if its start time is after the end time of the
 * last session. If true, it's considered a new session and added to the `newSessions` array. If not, it's considered
 * a duplicate session and a log message is printed. We also filter out everything that is older than 24 hours or in
 * the future.
 *
 * 9. **Time Calculation:** Compute the total time spent on the activity by summing the duration of each new session.
 *
 * 10. **Session Creation:** Create a record for each new session in the `sessionActivity` table using the
 * `prisma.sessionActivity.createMany()` method.
 *
 * 11. **Session Validation:** If no session activity records were created, log a message and return early.
 *
 * 12. **Domain Activity Update:** Update the `domainActivity` record, incrementing the total time spent and the count
 * of new sessions.
 *
 * 13. **Summary Upsert:** Upsert a summary record. If a record with the same date and member token exists, increment its
 * `activityTime` and `sessionCount` fields. If it doesn't exist, create a new record with the respective data.
 *
 *
 * This algorithm avoids duplicate session entries and properly updates associated records in a chronological order of the
 * activities. It assumes that the sessions are sent in chronological order, so a late arriving session could be
 * considered as a duplicate.
 */

async function handleRecordActivity(activity: CreateActivityInputInternal, token: string) {
  // Extract the domain from the activity's URL.
  const domain = extractDomain(activity.domain);

  // Fetch or create a domain record based on the domain from the activity.
  const domainRecord = await upsertDomain(domain);

  // Convert the activity date to an hour-based index value.
  const date = getHourBasedDate(activity.date);

  // Retrieve the DomainActivity record, or create a new, empty one. It's crucial to keep it empty initially,
  // as we need to filter the incoming session first.
  const domainActivityRecord = await upsertDomainActivity({
    date,
    token,
    domainId: domainRecord.id,
    activityType: activity.type,
  });

  if (!domainActivityRecord) {
    throw new Error('domainActivityRecord not found');
  }

  // Fetch the most recent session activity for this domain activity.
  const lastSession = await prismadb.sessionActivity.findFirst({
    where: {domainActivityId: domainActivityRecord.id},
    orderBy: {endDatetime: 'desc'},
  });

  // Get the end time of the last session, or 0 if there is no previous session.
  const lastSessionEndTime = lastSession ? lastSession.endDatetime.getTime() : 0;

  // Filter out any sessions from the activity that:
  // - Start before or at the same time as the end of the last session (considered duplicates).
  // - Start or end in the future.
  // - Ended more than 24 hours ago.
  // Log any filtered sessions.
  const newSessions: CreateSessionActivityInput[] = [];

  if (activity.sessions) {
    const currentTime = Date.now();

    activity.sessions.forEach((session) => {
      const startTime = new Date(session.startTime).getTime();
      const endTime = new Date(session.endTime).getTime();

      if (startTime <= lastSessionEndTime) {
        const msg = `Duplicate session detected: ${JSON.stringify(session)}`;
        Sentry.captureMessage(msg);
        console.error(msg);
        return;
      }

      if (startTime > currentTime || endTime > currentTime) {
        const msg = `Future session detected: ${JSON.stringify(session)}`;
        Sentry.captureMessage(msg);
        console.error(msg);
        return;
      }

      if (currentTime - endTime > twentyFourHoursInMilliseconds) {
        const msg = `Old session detected: ${JSON.stringify(session)}`;
        Sentry.captureMessage(msg);
        console.error(msg);
        return;
      }

      newSessions.push(session);
    });
  }

  // Compute the total time spent on the activity.
  const timeSpentInc =
    newSessions.reduce((mem, {startTime, endTime}) => mem + (endTime - startTime), 0) || 0;

  // Create session activity records for the new sessions.
  const sessionRecords = await prismadb.sessionActivity.createMany({
    data: newSessions.map(({url, title, startTime, endTime}) => {
      const isHTTPS = url?.toLowerCase().startsWith('https');
      return {
        url,
        domainActivityId: domainActivityRecord.id,
        startDatetime: new Date(startTime),
        endDatetime: new Date(endTime),
        title: title ?? undefined,
        isHTTPS,
      };
    }),
  });

  // Throw an error if no session activity records were created.
  if (!sessionRecords.count) {
    console.log('SessionActivity was not created');
    return;
  }

  // Upsert a domain activity record.
  await prismadb.domainActivity.update({
    where: {
      date_domainId_memberToken: {
        domainId: domainRecord.id,
        memberToken: token,
        date,
      },
    },
    data: {
      timeSpent: {
        increment: timeSpentInc,
      },
      activitiesCount: {
        increment: sessionRecords.count,
      },
    },
  });

  // Upsert a summary record.
  await prismadb.summary.upsert({
    where: {
      date_memberToken: {
        date,
        memberToken: token,
      },
    },
    update: {
      activityTime: {
        increment: timeSpentInc,
      },
      sessionCount: {
        increment: sessionRecords.count,
      },
    },
    create: {
      date,
      activityTime: timeSpentInc,
      sessionCount: sessionRecords.count,
      memberToken: token,
    },
  });
}

async function create({req, res}: PublicMethodContext) {
  const payload: CreateDomainActivityInput = req.body;

  if (!payload?.token) {
    return res.status(400).json(buildError('not auth'));
  }

  const member = await prismadb.member.count({
    where: {
      token: payload.token,
    },
  });

  if (!member) {
    return res.status(400).json(buildError('bad token'));
  }

  if (!payload?.sessions?.length) {
    return res.status(400).json(buildError('bad sessions format'));
  }

  try {
    const {activities} = translatePayloadToInternalStructure(payload);
    for (let i = 0; i < activities.length; i++) {
      await handleRecordActivity(activities[i], payload.token);
    }

    // Early status return
    res.status(201).end();

    // Check & update status in background
    await prismadb.member.update({
      where: {
        token: payload.token,
      },
      data: {
        status: STATUS.ACTIVE,
      },
    });
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
    Sentry.captureException(e);
    console.error(e);
  }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const {method} = req;
  const context: PublicMethodContext = {req, res};

  switch (method) {
    case 'POST':
      // Send data
      return create(context);
    default:
      return res.status(405).json(buildError('not allowed'));
  }
}
