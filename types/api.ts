import {Session} from 'next-auth';
import {NextApiRequest, NextApiResponse} from 'next';
import {
  DomainActivity,
  Member,
  PaymentStatus,
  SessionActivity,
  TAB_TYPE,
  Team,
  User,
} from '@prisma/client';
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

export type ApiMethodContext = {
  req: NextApiRequest;
  res: NextApiResponse;
};

export type AuthMethodContext = ApiMethodContext & {
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

export type CreateSessionActivityInternalInput = {
  url: string;
  title?: string;
  startTime: string;
  endTime: string;
};

export type CreateActivityInputInternal = {
  date: string;
  type: TAB_TYPE;
  domain: string;
  sessions: CreateSessionActivityInternalInput[];
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

export type MemberSummaryType = {
  activityTime: number | null;
  domainsCount: number | null;
  sessionCount: number | null;
  lastSessionEndDatetime: Date | null;
  isToday: boolean;
  topDomain: string | null;
  updatedAt?: Date | null;
};

export type TeamMembersType = Member & {
  lastSummary: MemberSummaryType;
  settings: SettingsType | null;
  summary7days: Array<{date: string; time: number}>;
};

export type SessionActivityOptionalUrl = SessionActivity & {url?: string};
export type MemberStatisticActivityType = DomainActivity & {
  sessionActivities: SessionActivityOptionalUrl[];
  domainName: string;
  domainsTags: DomainTags;
  productivityScore: number;
};

export type MemberDataType = Member & {
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

export type MemberCountsInfo = {
  _count: {
    teams: number;
    domainActivity: number;
    summary: number;
    memberEvent: number;
  };
  lastSessionEndDatetime?: string;
  activityTimeByDates: MemberUsageInfo[];
};
export type MemberUsageInfo = {
  date: string;
  activityTime: number;
};

export type SuperadminResponseUser = User & {
  trialEndsAt: string;
  member: MemberCountsInfo[];
  provider: string;
  product: number | null;
  paymentStatus: PaymentStatus | null;
  notifications: {
    trialEnd: string | null;
    welcome: boolean | null;
  };
};
export type SuperadminResponse = {
  users: SuperadminResponseUser[];
  domains: {
    classified: number;
    unclassified: number;
    unknown: number;
    total: number;
  };
};

export type StripeUrl = {
  url: string;
};

export type SettingsResponse = {
  hasSubscription: boolean;
};

export type SubscriptionStatusResponse = {
  status: PaymentStatus;
  canAddMember: boolean;
  hasTrial: boolean;
  trialEndsAt?: string;
};
