import {useMemo} from 'react';
import cx from 'classnames';
import {sortDays} from '../../utils/sort-days';
import {WorkHoursType} from '../../types/member';

interface WorkHoursProps {
  workHours: WorkHoursType | null | undefined;
  isCompact?: boolean;
}

function capitalize(text: string) {
  return text[0].toUpperCase() + text.substring(1);
}

export function WorkHours({workHours, isCompact}: WorkHoursProps) {
  const {days: workDays, time: workTime} = useMemo(() => {
    if (workHours?.days && workHours?.time?.startTime && workHours?.time?.endTime) {
      const days = Object.entries(workHours.days)
        .filter(([, val]) => !!val)
        .map(([key]) => capitalize(key));

      return {
        days: sortDays(days),
        time: `${workHours.time.startTime} to ${workHours.time.endTime}`,
      };
    }
    return {};
  }, [workHours]);

  const wrapperClass = cx('flex justify-end text-gray-400 text-12', {
    'flex-col items-start gap-1': Boolean(isCompact),
    'items-center': !isCompact,
  });

  return (
    <>
      {Boolean(workDays && workTime) && (
        <div className={wrapperClass} title="Tracking days & time">
          <div>
            {workDays?.map((day) => (
              <span key={day} className="text-sm py-0.5 px-1 rounded border text-gray-400 mr-1">
                {day}
              </span>
            ))}
          </div>
          <div>{workTime}</div>
        </div>
      )}
    </>
  );
}
