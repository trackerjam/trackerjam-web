import type {NextApiRequest, NextApiResponse} from 'next';
import * as Sentry from '@sentry/nextjs';
import {isWithinInterval, subDays} from 'date-fns';
import prismadb from '../../../lib/prismadb';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {AuthMethodContext, MemberUsageInfo} from '../../../types/api';
import {endpointHandler} from '../../../utils/api/endpoint-handler';
import {checkAdminAccess} from '../../../utils/check-admin-access';
import {PerfMarks} from '../../../utils/perf';
import {logger} from '../../../lib/logger';
import {classifyDomain, isKnownDomain} from '../../../utils/classification/classification';
import {maskEmailAddress} from '../../../utils/mask-email';
import {getIsoDateString} from '../../../utils/get-iso-date-string';
import {calcTrialEnd} from '../../../utils/api/calc-trial-end';
import {PRODUCT_NAMES} from '../../../const/payment';

const TIME_WINDOW_DAYS = 7;
const isWithinTimeWindow = (date: Date | string) => {
  const now = new Date();
  const startDate = subDays(now, TIME_WINDOW_DAYS);
  const checkDate = typeof date === 'string' ? new Date(date) : date;

  return isWithinInterval(checkDate, {start: startDate, end: now});
};

function getProductNameByProductId(productId: string | null | undefined) {
  if (!productId) {
    return null;
  }
  return PRODUCT_NAMES[productId] ?? null;
}

async function get({res, session}: AuthMethodContext) {
  const perf = new PerfMarks();
  perf.start();

  try {
    const users = await prismadb.user.findMany({
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          emailVerified: 'desc',
        },
      ],
      include: {
        member: {
          include: {
            summary: {
              orderBy: {
                date: 'desc',
              },
              take: TIME_WINDOW_DAYS,
              select: {
                lastSessionEndDatetime: true,
                activityTime: true,
              },
            },
            _count: true,
          },
        },
        payment: {
          select: {
            product: true,
          },
        },
      },
    });

    const responseUsers = users.map((user) => {
      // Make sure extract accounts from user to avoid exposing tokens and secrets
      const {member, ...rest} = user;
      return {
        ...rest,
        trialEndsAt: calcTrialEnd(user.createdAt as Date),
        email: user?.email ? maskEmailAddress(user.email) : '(unknown)',
        product: getProductNameByProductId(user.payment?.product),
        member: member.map(({summary, _count}) => {
          return {
            lastSessionEndDatetime: summary[0]?.lastSessionEndDatetime,
            _count,
            activityTimeByDates: summary.reduce((mem, {activityTime, lastSessionEndDatetime}) => {
              if (!isWithinTimeWindow(lastSessionEndDatetime as Date)) {
                return mem;
              }
              mem.push({
                date: getIsoDateString(lastSessionEndDatetime as Date),
                activityTime: activityTime as number,
              });
              return mem;
            }, [] as MemberUsageInfo[]),
          };
        }),
      };
    });
    perf.mark('findUsers');

    const allDomains = await prismadb.domain.findMany();
    const domainCounts = allDomains.reduce(
      (acc, {domain}) => {
        const domainTags = classifyDomain(domain);
        const isKnown = isKnownDomain(domain);

        let type = 'classified';
        if (!isKnown) {
          type = 'unknown';
        } else if (domainTags.Other === 1 || domainTags.Unknown === 1) {
          type = 'unclassified';
        }

        if (!acc[type]) {
          acc[type] = 0;
        }
        acc[type] += 1;

        return acc;
      },
      {} as {[key: string]: number}
    );
    domainCounts.total = allDomains.length;
    perf.mark('countDomains');

    logger.debug('Get Superadmin View', {
      userId: session.user.id,
      totalTimeMs: performance.now() - perf.startTime,
      perfMarks: perf.getObjectLogs(),
    });

    res.json({users: responseUsers, domains: domainCounts});
  } catch (e) {
    res.status(500).json(buildError(getErrorMessage(e)));
    Sentry.captureException(e);
    console.error(e);
  }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return endpointHandler({
    req,
    res,
    handlers: {get},
    checkPermission: async ({session}) => {
      const {user} = session;
      return checkAdminAccess(user?.id);
    },
  });
}
