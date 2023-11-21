import {NextApiRequest} from 'next';
import {createId} from '@paralleldrive/cuid2';

const HEADER_REQUEST_ID = 'x-request-id';

export function assignRequestId(req: NextApiRequest) {
  const requestId = createId();
  req.headers[HEADER_REQUEST_ID] = requestId;
  return requestId;
}

export function getRequestId(req: NextApiRequest) {
  return req.headers[HEADER_REQUEST_ID] as string | undefined;
}
