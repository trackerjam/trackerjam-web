import {Session} from 'next-auth';
import {NextApiRequest, NextApiResponse} from 'next';

export interface SessionId extends Session {
  user: Session['user'] & {
    id: string;
    email: string;
  };
}

export type ErrorResponse = {
  error: boolean;
  errorMsg: string;
};

export type AuthMethodContext = {
  req: NextApiRequest;
  res: NextApiResponse;
  session: SessionId;
};

export type PublicMethodContext = {
  req: NextApiRequest;
  res: NextApiResponse;
};

export interface DashboardResponse {
  membersCount: number | undefined | null;
}
