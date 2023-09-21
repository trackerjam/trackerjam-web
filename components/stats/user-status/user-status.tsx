import {useEffect, useMemo, useState} from 'react';
import cx from 'classnames';
import {formatDistanceToNow} from 'date-fns';
import {DateActivityData} from '../../../types/api';
import {SettingsType} from '../../../types/member';
import {getMostRecentSessionTime} from './get-most-recent-session-time';

interface UserStatusProps {
  data: DateActivityData | null;
  settings: SettingsType | null | undefined;
}

enum ONLINE_STATUS {
  ONLINE = 'Online',
  AWAY = 'Away',
  OFFLINE = 'Offline',
}

const TIMEOUT = {
  AWAY: 10 * 60 * 1000, // 10 minute
  OFFLINE: 8 * 60 * 1000, // 20 minutes
};

const DOT_COLOR = {
  [ONLINE_STATUS.ONLINE]: 'bg-green-500',
  [ONLINE_STATUS.AWAY]: 'bg-yellow-500',
  [ONLINE_STATUS.OFFLINE]: 'bg-gray-500',
};

const TEXT_COLOR = {
  [ONLINE_STATUS.ONLINE]: 'text-green-500',
  [ONLINE_STATUS.AWAY]: 'text-yellow-500',
  [ONLINE_STATUS.OFFLINE]: 'text-gray-500',
};

function capitalize(text: string) {
  return text[0].toUpperCase() + text.substring(1);
}

export function UserStatus({data, settings}: UserStatusProps) {
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(Date.now());

  const {mostRecentSessionTimeFormatted, status} = useMemo(() => {
    if (!data) {
      return {};
    }
    const mostRecentSessionTimeMs = getMostRecentSessionTime(data.activities);

    let status = ONLINE_STATUS.ONLINE;
    if (mostRecentSessionTimeMs > TIMEOUT.AWAY) {
      status = ONLINE_STATUS.AWAY;
    }
    if (mostRecentSessionTimeMs > TIMEOUT.OFFLINE) {
      status = ONLINE_STATUS.OFFLINE;
    }

    return {
      mostRecentSessionTimeFormatted: formatDistanceToNow(
        new Date(currentTimeMs - mostRecentSessionTimeMs)
      ),
      status,
    };
  }, [data, currentTimeMs]);

  const workTimeStr = useMemo(() => {
    if (
      settings?.workHours?.days &&
      settings?.workHours?.time?.startTime &&
      settings?.workHours?.time?.endTime
    ) {
      const daysStr = Object.entries(settings.workHours.days)
        .filter(([, val]) => !!val)
        .map(([key]) => capitalize(key))
        .join(', ');
      const timeStr = `From ${settings.workHours.time.startTime} to ${settings.workHours.time.endTime}.`;
      return daysStr + '. ' + timeStr;
    }
    return null;
  }, [settings]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const dotColor = DOT_COLOR[status ?? ONLINE_STATUS.OFFLINE];
  const textColor = TEXT_COLOR[status ?? ONLINE_STATUS.OFFLINE];
  const isOnline = status === ONLINE_STATUS.ONLINE;

  return (
    <div>
      <div className="flex items-center gap-2">
        <div
          className={cx(
            'w-4 h-4 rounded-full',
            dotColor,
            isOnline ? 'animate-pulsate-border' : null
          )}
        ></div>
        <div className={cx('text-20 font-bold', textColor)}>{status ?? 'Unknown'}</div>
        <div>Last seen {mostRecentSessionTimeFormatted ?? 'unknown time'} ago</div>
      </div>
      {Boolean(workTimeStr) && <div>Work time: {workTimeStr}</div>}
    </div>
  );
}
