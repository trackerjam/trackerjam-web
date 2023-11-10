import {Session} from 'next-auth';
import {NextApiRequest, NextApiResponse} from 'next';
import {DomainActivity, Member, MemberEvent, SessionActivity, TAB_TYPE, Team} from '@prisma/client';
import {TAG} from '../utils/classification/tags';
import {SettingsType} from './member';

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
  sessions: Array<CreateSessionActivityInput>;
};

export type CreateDomainActivityInputInternal = {
  token: string;
  activities: Array<CreateActivityInputInternal>;
};

export type CreateSessionActivityInput = {
  url: string;
  title?: string;
  startTime: number;
  endTime: number;
};

export type CreateActivityInputInternal = {
  date: string;
  type: TAB_TYPE;
  domain: string;
  sessions: CreateSessionActivityInput[];
};

export interface SummaryResponse {
  activityTime?: number | null | undefined;
  domainsCount?: number | null | undefined;
  sessionCount?: number | null | undefined;
  totalDays?: number | null | undefined;
}

export type GetTeamResponse = (Team & {
  members: TeamMembersType[];
})[];

export type TeamMembersType = Member & {
  summary: {
    activityTime: number | null;
    domainsCount: number | null;
    sessionCount: number | null;
    lastSessionEndDatetime: Date | null;
    updatedAt?: Date | null;
  }[];
  settings: SettingsType | null;
};

export type SessionActivityOptionalUrl = SessionActivity & {url?: string};
export type MemberStatisticActivityType = DomainActivity & {
  sessionActivities: SessionActivityOptionalUrl[];
  domainName: string;
  domainsTags: DomainTags;
  productivityScore: number;
};

export type MemberDataType = Member & {
  memberEvent: MemberEvent[];
  settings: SettingsType | null;
};

export type MemberStatisticType = {
  member: MemberDataType;
  activitiesByDate: ActivitiesByDate;
};

export type ActivitiesByDate = {
  [date: string]: DateActivityData;
};

export type DateActivityData = {
  activities: MemberStatisticActivityType[];
  totalActivityTime: number;
  idleTime: number;
};

export type CreateMemberEventInput = {
  token: string;
  event: string;
  date: string;
};

export type DomainTags = {[key in keyof typeof TAG]?: number};
