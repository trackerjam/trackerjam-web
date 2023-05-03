import type {NextApiRequest, NextApiResponse} from 'next';
import extractDomain from 'extract-domain';
import {TAB_TYPE} from '.prisma/client';
import prismadb from '../../../../lib/prismadb';
import {getErrorMessage} from '../../../../utils/get-error-message';
import {buildError} from '../../../../utils/build-error';
import {CreateDomainActivityInput, PublicMethodContext} from '../../../../types/api';

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

  try {
    const domain = extractDomain(payload.domain);
    const domainRecord = await prismadb.domain.upsert({
      where: {
        domain,
      },
      update: {},
      create: {
        domain,
      },
    });

    const date = new Date(payload.date);
    const timeSpentInc =
      payload?.sessions?.reduce((mem, {startTime, endTime}) => mem + (endTime - startTime), 0) || 0;
    const activitiesCountInc = payload?.sessions?.length || 0;
    const sessionCountInc = payload?.sessions?.length || 0;

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
        type: payload.type || TAB_TYPE.WEBSITE,
        timeSpent: timeSpentInc,
        activitiesCount: activitiesCountInc,
        memberToken: payload.token,
      },
    });

    if (!activityRecord?.id) {
      res.status(500).json(buildError('activity error'));
      throw new Error('Activity record was not created');
    }

    const sessionRecords = await prismadb.sessionActivity.createMany({
      data: payload?.sessions?.map(({url, title, docTitle, startTime, endTime}) => {
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
      res.status(500).json(buildError('sessions error'));
      throw new Error('SessionActivity was not created');
    }

    await prismadb.summary.upsert({
      where: {
        date_memberToken: {
          date,
          memberToken: payload.token,
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
        memberToken: payload.token,
      },
    });

    return res.status(201).end();
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
