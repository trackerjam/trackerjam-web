import {Session} from 'next-auth';
import {NextApiRequest, NextApiResponse} from 'next';
import {DomainActivity, Member, SessionActivity, TAB_TYPE, Team} from '@prisma/client';

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
  token: string;
  activities: Array<CreateActivityInput>;
};

export type CreateActivityInput = {
  date: string;
  type: TAB_TYPE;
  domain: string;
  sessions: CreateSessionActivityInput[];
};

export type CreateSessionActivityInput = {
  url: string;
  title?: string;
  docTitle?: string;
  isHTTPS?: boolean;
  startTime: number;
  endTime: number;
};

export interface SummaryResponse {
  activityTime?: number | null | undefined;
  domainsCount?: number | null | undefined;
  sessionCount?: number | null | undefined;
  totalDays?: number | null | undefined;
}

export type GetTeamResponse = (Team & {
  members: MemberAndSummary[];
})[];

export type MemberAndSummary = Member & {
  summary: {
    activityTime: number | null;
    domainsCount: number | null;
    sessionCount: number | null;
    updatedAt: Date | null;
  }[];
};

export type MemberStatisticType = {
  member: Member | null;
  activities: (DomainActivity & {sessionActivities: SessionActivity[]})[];
};
