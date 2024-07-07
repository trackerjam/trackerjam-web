import {NextResponse} from 'next/server';
import {formatDistance} from 'date-fns';
import * as Sentry from '@sentry/node';
import nodemailer from 'nodemailer';
import {buildError} from '../../../../utils/build-error';
import {logger} from '../../../../lib/logger';
import prismadb from '../../../../lib/prismadb';
import {calcTrialEnd, calcTrialOffset} from '../../../../utils/api/calc-trial-end';
import {getTemplate} from './template';

export async function sendEmail(to: string, htmlTemplate: string) {
  if (!to) {
    throw new Error('Missing "to" or "token" fields for email');
  }

  if (!htmlTemplate) {
    throw new Error('Missing "htmlTemplate" for email');
  }

  const transporter = nodemailer.createTransport({
    url: process.env.EMAIL_SERVER,
  });

  return transporter.sendMail({
    to,
    from: 'Denis <hi@trackerjam.com>',
    replyTo: 'hi@trackerjam.com',
    sender: 'Denis from TrackerJam',
    subject: 'Your trial ends soon',
    text: '',
    html: htmlTemplate,
  });
}

export async function GET() {
  logger.info('[job/trial-ends] Running trial-email job');

  try {
    const usersWithTrialEnds = await prismadb.user.findMany({
      where: {
        createdAt: {
          lt: calcTrialOffset(0),
          gt: calcTrialOffset(2),
        },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        name: true,
        notifications: true,
      },
    });

    const extendedUsers = usersWithTrialEnds
      .filter((user) => {
        // Filter those who haven't received the email yet
        return !user.notifications?.trialEnd;
      })
      .map((user) => {
        if (!user.createdAt) {
          console.error('[job/trial-ends] User has no createdAt', {user});
          Sentry.captureException(new Error('[job/trial-ends] User has no createdAt'));
          return null;
        }

        const trialEnds = calcTrialEnd(user.createdAt);
        return {
          ...user,
          trialEnds,
          timeLeft: formatDistance(new Date(), trialEnds),
        };
      })
      .filter(Boolean);

    if (!extendedUsers.length) {
      logger.info('[job/trial-ends] No users with trial ends found');
      return NextResponse.json(buildError('No users with trial ends found'), {
        status: 404,
      });
    }
    logger.info('[job/trial-ends] Found users with trial ends', {count: extendedUsers.length});

    let count = 0;
    for (const user of extendedUsers) {
      if (user?.email) {
        logger.info('[job/trial-ends] Sending email', {email: user.email});
        await sendEmail(user.email, getTemplate({timeLeft: user.timeLeft}));

        await prismadb.notification.upsert({
          where: {
            userId: user.id,
          },
          update: {
            trialEnd: new Date(),
          },
          create: {
            trialEnd: new Date(),
            userId: user.id,
          },
        });

        count++;
      } else {
        logger.error('[job/trial-ends] Email not found', {user});
        Sentry.captureException(new Error('[job/trial-ends] Email not found'));
      }
    }

    return NextResponse.json({success: true, count, userIds: extendedUsers.map((u) => u?.id)});
  } catch (e: any) {
    logger.error('Error running trial-email job', {error: e.message});
    return NextResponse.json(buildError('server error'), {status: 500});
  }
}
