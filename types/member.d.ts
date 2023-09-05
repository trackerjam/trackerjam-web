import {Member} from '@prisma/client';

type SettingsType = {
  trackMode: 'ALL' | 'LIMITED';
  idleTime: number;
  includeDomains: Array<string>;
  excludeDomains: Array<string>;
};
export type CreateMemberDataType = Pick<Member, 'name' | 'email' | 'title'> & {
  settings: SettingsType;
};
export type EditMemberDataType = Partial<CreateMemberDataType> & {id?: string};
