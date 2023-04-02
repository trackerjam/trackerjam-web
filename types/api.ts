import {Session} from 'next-auth';

export interface SessionId extends Session {
  user: Session['user'] & {
    id: string;
    email: string;
  };
}
