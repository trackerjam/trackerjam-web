import {useMemo} from 'react';
import {DateActivityData, MemberDataType} from '../../../types/api';
import {SettingsType} from '../../../types/member';
import {WorkHours} from '../../common/work-hours';
import {UserStatusDot} from '../../common/user-status-dot';
import {getMostRecentSessionTs} from '../../../utils/get-most-recent-session-ts';

interface UserStatusProps {
  data: DateActivityData | null;
  settings: SettingsType | null | undefined;
  member: MemberDataType | null | undefined;
}

export function UserDetails({data, settings, member}: UserStatusProps) {
  const mostRecentSessionTimeMs = useMemo(() => {
    if (!data) {
      return null;
    }
    return getMostRecentSessionTs(data.activities);
  }, [data]);

  return (
    <div>
      <UserStatusDot lastUpdateTs={mostRecentSessionTimeMs} memberStatus={member?.status} />
      <WorkHours workHours={settings?.workHours} />
    </div>
  );
}
