import type {NextApiRequest, NextApiResponse} from 'next';
import {TAB_TYPE} from '.prisma/client';
import {STATUS} from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
import prismadb from '../../../../lib/prismadb';
import {getErrorMessage} from '../../../../utils/get-error-message';
import {buildError} from '../../../../utils/build-error';
import {
  CreateActivityInputInternal,
  CreateDomainActivityInput,
  CreateSessionActivityInternalInput,
  PublicMethodContext,
} from '../../../../types/api';
import {getHourBasedDate} from '../../../../utils/api/get-time-index';
import {translatePayloadToInternalStructure} from '../../../../utils/api/translate-payload';
import {humanizeDates} from '../../../../utils/api/humanize-dates';

const OLD_SESSION_THRESHOLD = 96 * 60 * 60 * 1000; // 96 hours

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

async function handleRecordActivity(activity: CreateActivityInputInternal, token: string) {
  // We expect the translate-payload.ts to handle domain extraction
  const domain = activity.domain;

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
  const lastSessionStartTime = lastSession ? lastSession.startDatetime.getTime() : 0;

  // Filter out any sessions from the activity that:
  // - Start before or at the same time as the end of the last session (considered duplicates).
  // - Start or end in the future.
  // - Ended more than 24 hours ago.
  // Log any filtered sessions.
  const newSessions: CreateSessionActivityInternalInput[] = [];
  let mostRecentSessionEndTimeTs = 0;

  if (activity.sessions) {
    const currentTime = Date.now();

    activity.sessions.forEach((session) => {
      const startTime = new Date(session.startTime).getTime();
      const endTime = new Date(session.endTime).getTime();
      mostRecentSessionEndTimeTs = Math.max(mostRecentSessionEndTimeTs, endTime);

      if (endTime === lastSessionEndTime && startTime === lastSessionStartTime) {
        const msg = 'Exactly the same session detected';
        const logData = JSON.stringify({
          payloadSession: humanizeDates(session),
          existingSession: lastSession,
        });
        sentryCatchException({data: logData, msg, token});
        console.error(msg, logData);
        return;
      }

      if (endTime < lastSessionEndTime) {
        // TODO: Filter out sessions that attempt to occupy non-empty spaces: specifically, where startTime or endTime overlaps with an existing session.
        // TODO: Query these overlapping sessions.
        // The reasoning is that I was working for several days and sessions accumulated but didn't synchronize for some reason.
        // Also, investigate why the extension attempts to backfill something that occurred 3 hours ago, even though we have newer
        // sessions that has already been processed.
        const msg = 'Session inconsistency detected';
        const logData = JSON.stringify({
          payloadSession: humanizeDates(session),
          existingSession: lastSession,
        });
        sentryCatchException({data: logData, msg, token});
        console.error(msg, logData);
        return;
      }

      if (startTime > currentTime || endTime > currentTime) {
        const msg = 'Future session detected';
        const logData = JSON.stringify(humanizeDates(session));
        sentryCatchException({data: logData, msg, token});
        console.error(msg, logData);
        return;
      }

      if (currentTime - endTime > OLD_SESSION_THRESHOLD) {
        const msg = 'Old session detected';
        const logData = JSON.stringify(humanizeDates(session));
        sentryCatchException({data: logData, msg, token});
        console.error(msg, logData);
        return;
      }

      newSessions.push(session);
    });
  }

  // Compute the total time spent on the activity.
  const timeSpentInc =
    newSessions.reduce(
      (mem, {startTime, endTime}) =>
        mem + (new Date(endTime).getTime() - new Date(startTime).getTime()),
      0
    ) || 0;

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
    skipDuplicates: true,
  });

  // Throw an error if no session activity records were created.
  if (!sessionRecords.count) {
    console.warn('SessionActivity was not created: sessionRecords is empty after filtering');
    sentryCatchException({
      msg: 'sessionRecords is empty after filtering',
      token,
      data: JSON.stringify({
        newSessionsLength: newSessions.length,
      }),
    });
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

  return {
    timeSpent: timeSpentInc,
    sessionCount: sessionRecords.count,
    endTime: new Date(mostRecentSessionEndTimeTs),
  };
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

  // Early status return to avoid HTTP 504 Gateway Timeout in case of large payloads
  // TODO - consider moving this to a background job and informing a client separately
  res.status(201).end();

  const {token} = payload;

  try {
    // Count processing time
    const startTime = performance.now();

    // TODO Add Winston logger and Transport to Datadog

    const {activities} = translatePayloadToInternalStructure(payload);
    const summaryUpdates: {
      [date: string]: {
        timeSpentInc: number;
        sessionCountInc: number;
        lastSessionEndDatetime: Date;
      };
    } = {};
    for (const activity of activities) {
      const activityStats = await handleRecordActivity(activity, token);
      const {timeSpent, sessionCount, endTime} = activityStats || {};

      if (endTime) {
        const dateIndex = getHourBasedDate(endTime)?.toISOString();
        if (!summaryUpdates[dateIndex]) {
          summaryUpdates[dateIndex] = {
            timeSpentInc: 0,
            sessionCountInc: 0,
            lastSessionEndDatetime: endTime,
          };
        }
        if (typeof timeSpent === 'number') {
          summaryUpdates[dateIndex].timeSpentInc += timeSpent;
        }
        if (typeof sessionCount === 'number') {
          summaryUpdates[dateIndex].sessionCountInc += sessionCount;
        }
      }
    }

    for (const dateIndex of Object.keys(summaryUpdates)) {
      const {timeSpentInc, sessionCountInc, lastSessionEndDatetime} = summaryUpdates[dateIndex];
      await prismadb.summary.upsert({
        where: {
          date_memberToken: {
            date: dateIndex,
            memberToken: token,
          },
        },
        update: {
          activityTime: {
            increment: timeSpentInc,
          },
          sessionCount: {
            increment: sessionCountInc,
          },
          updatedAt: new Date(),
          lastSessionEndDatetime,
        },
        create: {
          date: dateIndex,
          updatedAt: new Date(),
          lastSessionEndDatetime,
          activityTime: timeSpentInc,
          sessionCount: sessionCountInc,
          memberToken: token,
        },
      });
    }

    const endTime = performance.now();
    console.log(
      `Activity processing time: ${(endTime - startTime).toFixed(0)}ms. Payload size: ${
        payload.sessions.length
      }`
    );

    // Check & update status in background
    await prismadb.member.update({
      where: {
        token,
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

function sentryCatchException({data, msg, token}: {data?: string; msg: string; token: string}) {
  Sentry.captureMessage(msg, {
    user: {
      id: token,
    },
    extra: {
      session: data,
    },
    level: 'warning',
  });
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
