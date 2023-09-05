import {Member} from '@prisma/client';
import {DAY} from '../const/member';

export type SettingsType = {
  trackMode: 'ALL' | 'LIMITED';
  idleTime: number;
  includeDomains: Array<string>;
  excludeDomains: Array<string>;
  workHours: WorkHoursType;
};

export type WorkHoursType = {
  days: WorkHoursDaysType;
  time: WorkHoursTimeType;
};

export type WorkHoursDaysType = {
  [key in DAY]?: boolean;
};

export type WorkHoursTimeType = {
  startTime: string;
  endTime: string;
};

export type CreateMemberDataType = Pick<Member, 'name' | 'email' | 'title'> & {
  settings: SettingsType;
};
export type EditMemberDataType = Partial<CreateMemberDataType> & {id?: string};
