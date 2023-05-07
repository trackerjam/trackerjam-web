import {NextApiRequest, NextApiResponse} from 'next';
import handler from './[token]';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return handler(req, res);
}
