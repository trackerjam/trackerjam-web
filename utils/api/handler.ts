import {NextApiRequest, NextApiResponse} from 'next';
import {getServerSession} from 'next-auth/next';
import {authOptions} from '../../app/api/auth/[...nextauth]/route';
import {AuthMethodContext, SessionId} from '../../types/api';
import {buildError} from '../build-error';

type MethodNames = 'get' | 'post' | 'put' | 'delete';

type MethodHandlerType = {
  [methodName in MethodNames]?: (context: AuthMethodContext) => Promise<any>;
};

interface HandlerInterface {
  req: NextApiRequest;
  res: NextApiResponse;
  handlers: MethodHandlerType;
}

export async function endpointHandler({req, res, handlers}: HandlerInterface) {
  const session = (await getServerSession(req, res, authOptions)) as SessionId;
  const {method} = req;

  if (!session?.user?.id) {
    return res.status(400).json(buildError('not auth'));
  }

  const context: AuthMethodContext = {req, res, session};

  const lowerCaseMethod = method?.toLowerCase();
  const handler = handlers[lowerCaseMethod as MethodNames];
  if (!handler) {
    return res.status(405).json(buildError('not allowed'));
  }

  return handler(context);
}
