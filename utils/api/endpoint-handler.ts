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
  checkPermission?: (context: AuthMethodContext) => boolean | Promise<boolean>;
}

const IS_DEV = process.env.NODE_ENV === 'development';

export async function endpointHandler({req, res, handlers, checkPermission}: HandlerInterface) {
  const session = (await getServerSession(req, res, authOptions)) as SessionId;
  const {method} = req;

  if (!session?.user?.id) {
    return res.status(400).json(buildError('not auth'));
  }

  if (typeof checkPermission === 'function' && !IS_DEV) {
    const hasPermission = await checkPermission({req, res, session});
    if (!hasPermission) {
      return res.status(403).json(buildError('not allowed'));
    }
  }

  const context: AuthMethodContext = {req, res, session};
  const lowerCaseMethod = method?.toLowerCase();
  const handler = handlers[lowerCaseMethod as MethodNames];
  if (!handler) {
    return res.status(405).json(buildError('not allowed'));
  }

  return handler(context);
}
