import {Session} from 'next-auth';

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

export interface DashboardResponse {
  membersCount: number | undefined | null;
}
