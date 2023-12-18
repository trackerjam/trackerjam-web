import type {NextApiRequest, NextApiResponse} from 'next';
import {TAB_TYPE} from '.prisma/client';
import {SessionActivity, STATUS} from '@prisma/client';
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
import {logger} from '../../../../lib/logger';
import {assignRequestId} from '../../../../utils/api/request-id';
import {ObjectPerfMarkType, PerfMarks} from '../../../../utils/perf';

type ActivityPerfReport = {
  domain: string;
  perfMarks: ObjectPerfMarkType;
};

const OLD_SESSION_THRESHOLD = 96 * 60 * 60 * 1000; // 96 hours

async function upsertDomain(domain: string) {
  // Check if the domain already exists
  const existingDomain = await prismadb.domain.findUnique({
    where: {
      domain,
    },
  });

  // If the domain does not exist, create it
  if (!existingDomain) {
    return prismadb.domain.create({
      data: {
        domain,
      },
    });
  }

  // If the domain already exists, return the existing record (or handle as needed)
  return existingDomain;
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
  // Check if the domain activity already exists
  const existingDomainActivity = await prismadb.domainActivity.findUnique({
    where: {
      date_domainId_memberToken: {
        date,
        domainId,
        memberToken: token,
      },
    },
  });

  // If the domain activity does not exist, create it
  if (!existingDomainActivity) {
    return prismadb.domainActivity.create({
      data: {
        date,
        domainId,
        type: activityType || TAB_TYPE.WEBSITE,
        timeSpent: 0,
        activitiesCount: 0,
        memberToken: token,
      },
    });
  }

  // If the domain activity already exists, return the existing record
  // Optionally, you can handle any update logic here if needed
  return existingDomainActivity;
}

interface HandleRecordActivityInput {
  activity: CreateActivityInputInternal;
  token: string;
  requestId: string;
}
async function handleRecordActivity({activity, token, requestId}: HandleRecordActivityInput) {
  // We expect the translate-payload.ts to handle domain extraction
  const domain = activity.domain;

  const perf = new PerfMarks();
  perf.start();

  // Fetch or create a domain record based on the domain from the activity.
  const domainRecord = await upsertDomain(domain);
  perf.mark('upsertDomain', {domain});

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
  perf.mark('initDomainActivity', {domain});

  if (!domainActivityRecord) {
    throw new Error('domainActivityRecord not found');
  }

  // Get the end time of the last session, or 0 if there is no previous session.
  let lastSessionEndTime = 0;
  let lastSessionStartTime = 0;

  let lastSession: SessionActivity | null = null;

  if (
    domainActivityRecord.lastSessionEndDatetime &&
    domainActivityRecord.lastSessionStartDatetime
  ) {
    lastSessionEndTime = domainActivityRecord.lastSessionEndDatetime.getTime();
    lastSessionStartTime = domainActivityRecord.lastSessionStartDatetime.getTime();
    perf.mark('findLastSession', {domain});
  } else {
    // Fetch the most recent session activity for this domain activity.
    lastSession = await prismadb.sessionActivity.findFirst({
      where: {domainActivityId: domainActivityRecord.id},
      orderBy: {endDatetime: 'desc'},
    });
    lastSessionEndTime = lastSession ? lastSession.endDatetime.getTime() : 0;
    lastSessionStartTime = lastSession ? lastSession.startDatetime.getTime() : 0;
    perf.mark('findLastSession', {domain, madeQuery: true});
  }

  // Filter out any sessions from the activity that:
  // - Exactly match the last session (considered duplicates).
  // - Start before or at the same time as the end of the last session (considered inconsistent).
  // - Start or end in the future.
  // - Ended more than OLD_SESSION_THRESHOLD hours ago.
  // Log any filtered sessions.
  const newSessions: CreateSessionActivityInternalInput[] = [];
  let lastSessionEndTimeTs = 0;
  let lastSessionStartTimeTs = 0;

  if (activity.sessions) {
    const currentTime = Date.now();

    activity.sessions.forEach((session) => {
      const startTime = new Date(session.startTime).getTime();
      const endTime = new Date(session.endTime).getTime();

      if (endTime === lastSessionEndTime && startTime === lastSessionStartTime) {
        const msg = 'Exactly the same session detected';
        const logData = {
          payloadSession: humanizeDates(session),
          lastSession,
          requestId,
        };
        sentryCatchException({msg, token});
        logger.error(msg, logData);
        return;
      }

      if (endTime < lastSessionEndTime) {
        const msg = 'Session inconsistency detected';
        const logData = {
          payloadSession: humanizeDates(session),
          lastSession,
          requestId,
        };
        sentryCatchException({msg, token});
        logger.error(msg, logData);
        return;
      }

      if (startTime > currentTime || endTime > currentTime) {
        const msg = 'Future session detected';
        const logData = {
          payloadSession: humanizeDates(session),
          currentTime: new Date(currentTime).toISOString(),
          currentTimeTs: currentTime,
          requestId,
        };
        sentryCatchException({msg, token});
        logger.error(msg, logData);
        return;
      }

      if (currentTime - endTime > OLD_SESSION_THRESHOLD) {
        const msg = 'Old session detected';
        const logData = {
          payloadSession: humanizeDates(session),
        };
        sentryCatchException({msg, token});
        logger.error(msg, logData);
        return;
      }

      lastSessionEndTimeTs = Math.max(lastSessionEndTimeTs, endTime);
      lastSessionStartTimeTs = Math.max(lastSessionStartTimeTs, startTime);
      newSessions.push(session);
    });
  }
  perf.mark('filterSessions', {domain});

  // Throw an error if no session activity records were created.
  if (!newSessions.length) {
    const msg = 'Skip sessionActivity creation: newSessions is empty after filtering';
    logger.warn(msg);
    sentryCatchException({
      msg,
      token,
      data: JSON.stringify({
        newSessionsLength: newSessions.length,
      }),
    });
    return;
  }

  // Compute the total time spent on the activity.
  const timeSpentInc =
    newSessions.reduce(
      (mem, {startTime, endTime}) =>
        mem + (new Date(endTime).getTime() - new Date(startTime).getTime()),
      0
    ) || 0;

  // Create session activity records for the new sessions.
  const sessionData = newSessions.map(({url, title, startTime, endTime}) => {
    const isHTTPS = url?.toLowerCase().startsWith('https');
    return {
      url,
      domainActivityId: domainActivityRecord.id,
      startDatetime: new Date(startTime),
      endDatetime: new Date(endTime),
      title: title ?? undefined,
      isHTTPS,
    };
  });
  const sessionRecords = await prismadb.sessionActivity.createMany({
    data: sessionData,
  });
  perf.mark('createSessionActivities', {domain});

  // Throw an error if no session activity records were created.
  if (!sessionRecords.count) {
    const msg = 'SessionActivity was not created: sessionRecords is empty after query';
    logger.error(msg);
    sentryCatchException({
      msg,
      token,
      data: JSON.stringify({
        newSessionsLength: newSessions.length,
      }),
    });
    return;
  }

  // Update a domain activity record.
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
      lastSessionEndDatetime: new Date(lastSessionEndTimeTs),
      lastSessionStartDatetime: new Date(lastSessionStartTimeTs),
    },
  });

  perf.mark('updateDomainActivity', {domain});

  return {
    timeSpent: timeSpentInc,
    sessionCount: sessionRecords.count,
    endTime: new Date(lastSessionEndTimeTs),
    perfReport: {
      perfMarks: perf.getObjectLogs(),
      domain,
    },
  };
}

async function create({req, res}: PublicMethodContext) {
  const payload: CreateDomainActivityInput = req.body;

  // Assign a request id for logging and debug purposes
  const requestId = assignRequestId(req);

  const perf = new PerfMarks();
  perf.start();

  if (!payload?.token) {
    return res.status(400).json(buildError('not auth'));
  }

  const member = await prismadb.member.count({
    where: {
      token: payload.token,
    },
  });
  perf.mark('countMembers');

  if (!member) {
    return res.status(400).json(buildError('bad token'));
  }

  if (!payload?.sessions?.length) {
    return res.status(400).json(buildError('bad sessions format'));
  }

  // Early status return to avoid HTTP 504 Gateway Timeout in case of large payloads
  res.status(201).end();
  perf.mark('responseSent');

  const {token} = payload;

  try {
    const {activities} = translatePayloadToInternalStructure(payload);
    logger.debug('Payload translated', {
      requestId,
    });
    perf.mark('translatePayload');

    const summaryUpdates: {
      [date: string]: {
        timeSpentInc: number;
        sessionCountInc: number;
        lastSessionEndDatetime: Date;
      };
    } = {};

    const activitiesPerfArr: ActivityPerfReport[] = [];
    for (const activity of activities) {
      const activityStats = await handleRecordActivity({
        activity,
        token,
        requestId,
      });
      const {timeSpent, sessionCount, endTime, perfReport} = activityStats || {};
      if (perfReport) {
        activitiesPerfArr.push(perfReport);
      }

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
        if (summaryUpdates[dateIndex].lastSessionEndDatetime < endTime) {
          logger.warn('summaryUpdates.lastSessionEndDatetime is not the latest', {
            requestId,
            dateIndex,
            endTime,
            lastSessionEndDatetime: summaryUpdates[dateIndex].lastSessionEndDatetime,
          });

          // Save last session end time
          summaryUpdates[dateIndex].lastSessionEndDatetime = endTime;
        }
      }
    }
    perf.mark('handleRecordActivities');

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
    perf.mark('upsertSummary');

    // Check & update status in background
    await prismadb.member.update({
      where: {
        token,
      },
      data: {
        status: STATUS.ACTIVE,
      },
    });
    perf.mark('updateMemberStatus');

    logger.debug('Activity Processing', {
      requestId,
      token,
      summaryUpdates,
      totalTimeMs: performance.now() - perf.startTime,
      payloadSize: payload.sessions.length,
      domainCount: activitiesPerfArr.length,
      perfMarks: perf.getObjectLogs(),
      activitiesPerf: activitiesPerfArr,
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
