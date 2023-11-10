import cx from 'classnames';
import {useMemo} from 'react';
import {formatDistanceToNow} from 'date-fns';

interface UserStatusDotProps {
  lastUpdateTs: number | null | undefined;
  isCompact?: boolean;
}
enum ONLINE_STATUS {
  NEW = 'New',
  ONLINE = 'Online',
  AWAY = 'Away',
  OFFLINE = 'Offline',
}

const TIMEOUT = {
  AWAY: 10 * 60 * 1000, // 10 minute
  OFFLINE: 8 * 60 * 1000, // 20 minutes
};

const DOT_COLOR = {
  [ONLINE_STATUS.NEW]: 'bg-indigo-400',
  [ONLINE_STATUS.ONLINE]: 'bg-green-500',
  [ONLINE_STATUS.AWAY]: 'bg-yellow-500',
  [ONLINE_STATUS.OFFLINE]: 'bg-gray-500',
};

const TEXT_COLOR = {
  [ONLINE_STATUS.NEW]: 'text-indigo-400',
  [ONLINE_STATUS.ONLINE]: 'text-green-500',
  [ONLINE_STATUS.AWAY]: 'text-yellow-500',
  [ONLINE_STATUS.OFFLINE]: 'text-gray-500',
};

export function UserStatusDot({lastUpdateTs, isCompact}: UserStatusDotProps) {
  const {lastUpdateFormatted, status} = useMemo(() => {
    let status = ONLINE_STATUS.NEW;

    if (!lastUpdateTs) {
      return {
        status,
        lastUpdateFormatted: null,
      };
    }

    const now = Date.now();
    const timeDistance = now - lastUpdateTs;

    status = ONLINE_STATUS.ONLINE;
    if (timeDistance > TIMEOUT.AWAY) {
      status = ONLINE_STATUS.AWAY;
    }
    if (timeDistance > TIMEOUT.OFFLINE) {
      status = ONLINE_STATUS.OFFLINE;
    }

    return {
      status,
      lastUpdateFormatted: formatDistanceToNow(new Date(lastUpdateTs)),
    };
  }, [lastUpdateTs]);

  const dotColor = DOT_COLOR[status ?? ONLINE_STATUS.OFFLINE];
  const textColor = TEXT_COLOR[status ?? ONLINE_STATUS.OFFLINE];
  const isOnline = status === ONLINE_STATUS.ONLINE;

  const textClass = cx('text-gray-500', {
    'text-12': isCompact,
  });

  const hasEverBeenOnline = Boolean(lastUpdateFormatted);

  return (
    <div className="flex gap-2 items-center">
      <div className="flex gap-2 items-center">
        <div
          className={cx(
            'w-4 h-4 rounded-full',
            dotColor,
            isOnline ? 'animate-pulsate-border' : null
          )}
        ></div>
        <div className={cx('text-20 font-bold', textColor)}>{status}</div>
      </div>
      {Boolean(status) && (
        <div className={textClass}>
          {hasEverBeenOnline && <>(Last seen {lastUpdateFormatted} ago)</>}
          {!hasEverBeenOnline && <>(No reported data yet)</>}
        </div>
      )}
    </div>
  );
}
