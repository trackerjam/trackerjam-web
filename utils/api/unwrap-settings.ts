import {Member, MemberSettings} from '@prisma/client';
import {SettingsType} from '../../types/member';

type MemberWithOptionalSettings<T extends Member> = T & {
  settings?: MemberSettings | null;
};

export function unwrapSettings<T extends Member>(member: MemberWithOptionalSettings<T>): T {
  return {
    ...member,
    settings:
      typeof member?.settings?.settings === 'object'
        ? (member.settings.settings as SettingsType)
        : null,
  };
}
