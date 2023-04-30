import {Session} from 'next-auth';
import {NextApiRequest, NextApiResponse} from 'next';
import {TAB_TYPE} from '@prisma/client';

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

export type CreateDomainActivityInput = {
  date: string;
  type: TAB_TYPE;
  token: string;
  domain: string;
  sessions: CreateSessionActivityInput[];
};

export type CreateSessionActivityInput = {
  url: string;
  title?: string;
  docTitle?: string;
  startTime: number;
  endTime: number;
};
