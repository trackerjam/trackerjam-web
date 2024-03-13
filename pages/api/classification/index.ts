import type {NextApiRequest, NextApiResponse} from 'next';
import * as Sentry from '@sentry/nextjs';
import {getErrorMessage} from '../../../utils/get-error-message';
import {buildError} from '../../../utils/build-error';
import {ApiMethodContext, PublicMethodContext} from '../../../types/api';
import {classifyDomain, isKnownDomain} from '../../../utils/classification/classification';
import {getProductivityScore} from '../../../utils/classification/get-score';

async function get({req, res}: ApiMethodContext) {
  const {domain} = req.query;

  if (!domain) {
    return res.status(400).json(buildError('bad params'));
  }

  try {
    const domainsTags = classifyDomain(domain as string);
    const isKnown = isKnownDomain(domain as string);
    const score = getProductivityScore(domainsTags);

    return res.status(200).json({
      tags: domainsTags,
      score,
      isKnown,
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
    case 'GET':
      // Send data
      return get(context);
    default:
      return res.status(405).json(buildError('not allowed'));
  }
}
