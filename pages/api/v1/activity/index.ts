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
import {logger} from '../../../../lib/logger';
import {assignRequestId} from '../../../../utils/api/request-id';

const OLD_SESSION_THRESHOLD = 96 * 60 * 60 * 1000; // 96 hours

type LogReportType = {[eventName: string]: number | string | LogReportType | LogReportType[]};

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
}
async function handleRecordActivity({activity, token}: HandleRecordActivityInput) {
  // We expect the translate-payload.ts to handle domain extraction
  const domain = activity.domain;

  const logReportArr: LogReportType[] = [];
  const startTime = performance.now();
  const logReport: LogReportType = {
    _domain: domain,
  };

  // Fetch or create a domain record based on the domain from the activity.
  const domainRecord = await upsertDomain(domain);
  logReport.upsertDomain1 = performance.now() - startTime;

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
  // TODO Consider saving lastSessionEndDatetime and lastSessionStartDatetime in the domainActivityRecord
  logReport.initDomainActivity2 = performance.now() - startTime;

  if (!domainActivityRecord) {
    throw new Error('domainActivityRecord not found');
  }

  // Fetch the most recent session activity for this domain activity.
  const lastSession = await prismadb.sessionActivity.findFirst({
    where: {domainActivityId: domainActivityRecord.id},
    orderBy: {endDatetime: 'desc'},
  });
  logReport.findLastSession3 = performance.now() - startTime;

  // Get the end time of the last session, or 0 if there is no previous session.
  const lastSessionEndTime = lastSession ? lastSession.endDatetime.getTime() : 0;
  const lastSessionStartTime = lastSession ? lastSession.startDatetime.getTime() : 0;

  // Filter out any sessions from the activity that:
  // - Exactly match the last session (considered duplicates).
  // - Start before or at the same time as the end of the last session (considered inconsistent).
  // - Start or end in the future.
  // - Ended more than OLD_SESSION_THRESHOLD hours ago.
  // Log any filtered sessions.
  const newSessions: CreateSessionActivityInternalInput[] = [];
  let mostRecentSessionEndTimeTs = 0; // TODO Check if latest among other domains

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
  logReport.filterSessions4 = performance.now() - startTime;

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
    logReportArr.push(logReport);
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
  logReport.createSessionActivity5 = performance.now() - startTime;

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
    logReportArr.push(logReport);
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
    },
  });

  logReport.upsertDomainActivity6 = performance.now() - startTime;
  logReportArr.push(logReport);

  return {
    timeSpent: timeSpentInc,
    sessionCount: sessionRecords.count,
    endTime: new Date(mostRecentSessionEndTimeTs),
    logReportArr,
  };
}

async function create({req, res}: PublicMethodContext) {
  const payload: CreateDomainActivityInput = req.body;

  // Assign a request id for logging and debug purposes
  const requestId = assignRequestId(req);

  // Log performance report
  const logReport: LogReportType = {
    _requestId: requestId,
  };
  const startTime = performance.now();

  if (!payload?.token) {
    return res.status(400).json(buildError('not auth'));
  }

  const member = await prismadb.member.count({
    where: {
      token: payload.token,
    },
  });
  logReport.countMembers1 = performance.now() - startTime;

  if (!member) {
    return res.status(400).json(buildError('bad token'));
  }

  if (!payload?.sessions?.length) {
    return res.status(400).json(buildError('bad sessions format'));
  }

  // Early status return to avoid HTTP 504 Gateway Timeout in case of large payloads
  // TODO - consider moving this to a background job and informing a client separately
  res.status(201).end();
  logReport.responseSent2 = performance.now() - startTime;

  const {token} = payload;

  try {
    const {activities} = translatePayloadToInternalStructure(payload);
    logger.debug('Payload translated', {
      requestId,
      payload,
      activities,
    });
    logReport.translatePayload3 = performance.now() - startTime;

    const summaryUpdates: {
      [date: string]: {
        timeSpentInc: number;
        sessionCountInc: number;
        lastSessionEndDatetime: Date;
      };
    } = {};

    logReport._activities = [];
    for (const activity of activities) {
      const activityStats = await handleRecordActivity({
        activity,
        token,
      });
      const {timeSpent, sessionCount, endTime, logReportArr} = activityStats || {};
      if (logReportArr) {
        logReport._activities = logReport._activities.concat(logReportArr);
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
      }
    }
    logReport.handleRecordActivities4 = performance.now() - startTime;

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
    logReport.upsertSummary5 = performance.now() - startTime;

    // Check & update status in background
    await prismadb.member.update({
      where: {
        token,
      },
      data: {
        status: STATUS.ACTIVE,
      },
    });
    logReport.updateMemberStatus6 = performance.now() - startTime;

    logger.debug('Activity processing', {
      _totalTimeMs: performance.now() - startTime,
      _payloadSize: payload.sessions.length,
      ...logReport,
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
