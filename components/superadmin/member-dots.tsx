import cx from 'classnames';
import React, {useMemo} from 'react';
import {Tooltip} from 'flowbite-react';
import {format} from 'date-fns';
import {MemberCountsInfo} from '../../types/api';

const formatDate = (date: string | Date | null) => {
  if (!date) {
    return '';
  }
  const d = new Date(date);
  return format(d, 'dd MMM yyyy @ HH:mm');
};

interface MemberDotsProps {
  membersInfo: MemberCountsInfo[];
}

export function MemberDots({membersInfo}: MemberDotsProps) {
  const sortedInfo = useMemo(() => {
    return membersInfo?.sort((a, b) => {
      const aCount = a?._count?.domainActivity || 0;
      const bCount = b?._count?.domainActivity || 0;
      return bCount - aCount;
    });
  }, [membersInfo]);

  if (!membersInfo) return <div>Err</div>;

  return (
    <div className="flex gap-[2px]">
      {sortedInfo?.map(({_count, lastSessionEndDatetime = null}, index) => {
        const {domainActivity, memberEvent, summary} = _count || {};
        const total = domainActivity + memberEvent + summary;
        const active = domainActivity > 0 || memberEvent > 0 || summary > 0;

        const color = active ? 'bg-green-500' : 'bg-gray-300';
        const textColor = active ? 'text-white' : 'text-gray-500';
        return (
          <Tooltip
            content={
              <div className="flex flex-col text-12">
                <div>Summary days: {summary}</div>
                <div>Total domain activities: {domainActivity}</div>
                <div>Member events: {memberEvent}</div>
                <div>
                  Last session:{' '}
                  {lastSessionEndDatetime ? formatDate(lastSessionEndDatetime) : 'none'}
                </div>
              </div>
            }
            key={index}
          >
            <div
              key={total}
              className={cx(
                'w-5 h-5 rounded-full text-10 flex justify-center items-center cursor-pointer',
                color,
                textColor
              )}
            >
              {summary}
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}
