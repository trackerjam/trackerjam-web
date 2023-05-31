import type {NextApiRequest, NextApiResponse} from 'next';
import extractDomain from 'extract-domain';
import {TAB_TYPE} from '.prisma/client';
import {STATUS} from '@prisma/client';
import prismadb from '../../../../lib/prismadb';
import {getErrorMessage} from '../../../../utils/get-error-message';
import {buildError} from '../../../../utils/build-error';
import {
  CreateActivityInput,
  CreateDomainActivityInput,
  PublicMethodContext,
} from '../../../../types/api';

async function handleRecordActivity(activity: CreateActivityInput, token: string) {
  const domain = extractDomain(activity.domain);
  const domainRecord = await prismadb.domain.upsert({
    where: {
      domain,
    },
    update: {},
    create: {
      domain,
    },
  });

  const date = new Date(activity.date);
  const timeSpentInc =
    activity?.sessions?.reduce((mem, {startTime, endTime}) => mem + (endTime - startTime), 0) || 0;
  const activitiesCountInc = activity?.sessions?.length || 0;
  const sessionCountInc = activity?.sessions?.length || 0;

  const activityRecord = await prismadb.domainActivity.upsert({
    where: {
      date_domainId: {
        domainId: domainRecord.id,
        date,
      },
    },
    update: {
      timeSpent: {
        increment: timeSpentInc,
      },
      activitiesCount: {
        increment: activitiesCountInc,
      },
    },
    create: {
      date,
      domainId: domainRecord.id,
      type: activity.type || TAB_TYPE.WEBSITE,
      timeSpent: timeSpentInc,
      activitiesCount: activitiesCountInc,
      memberToken: token,
    },
  });

  if (!activityRecord?.id) {
    throw new Error('Activity record was not created');
  }

  const sessionRecords = await prismadb.sessionActivity.createMany({
    data: activity?.sessions?.map(({url, title, docTitle, startTime, endTime}) => {
      const isHTTPS = url?.toLowerCase().startsWith('https');
      return {
        url,
        domainActivityId: activityRecord.id,
        startDatetime: new Date(startTime),
        endDatetime: new Date(endTime),
        title: title ?? undefined,
        docTitle: docTitle ?? undefined,
        isHTTPS,
      };
    }),
  });

  if (!sessionRecords.count) {
    throw new Error('SessionActivity was not created');
  }

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
        increment: sessionCountInc,
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

  const activity = payload.activities;

  if (!activity?.length) {
    return res.status(400).json(buildError('bad activity format'));
  }

  try {
    for (let i = 0; i < activity.length; i++) {
      await handleRecordActivity(activity[i], payload.token);
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
    console.error(e);
    res.status(500).json(buildError(getErrorMessage(e)));
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
