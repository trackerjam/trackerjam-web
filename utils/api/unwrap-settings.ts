import {Member, MemberSettings} from '@prisma/client';
import {SettingsType} from '../../types/member';

export type MemberWithOptionalSettings<T extends Member> = T & {
  settings?: MemberSettings | null;
};

export function unwrapSettings<T extends Member>(member: MemberWithOptionalSettings<T>): T {
  const unwrapped =
    typeof member?.settings?.settings === 'object'
      ? (member.settings.settings as SettingsType)
      : {};

  // Fix old settings objects, that may include nested "settings" struct
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  delete unwrapped.settings;

  return {
    ...member,
    settings: unwrapped,
  };
}
