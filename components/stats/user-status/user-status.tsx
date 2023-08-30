import {useEffect, useMemo, useState} from 'react';
import cx from 'classnames';
import {formatDistanceToNow} from 'date-fns';
import {DateActivityData} from '../../../types/api';
import {getMostRecentSessionTime} from './get-most-recent-session-time';

interface UserStatusProps {
  data: DateActivityData | null;
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

export function UserStatus({data}: UserStatusProps) {
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
    <div className="flex items-center gap-2">
      <div
        className={cx('w-4 h-4 rounded-full', dotColor, isOnline ? 'animate-pulsate-border' : null)}
      ></div>
      <div className={cx('text-22 font-bold', textColor)}>{status ?? 'Unknown'}</div>
      <div>Last seen {mostRecentSessionTimeFormatted ?? 'unknown time'} ago</div>
    </div>
  );
}
