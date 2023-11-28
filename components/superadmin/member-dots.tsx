import cx from 'classnames';
import React, {useMemo} from 'react';
import {Tooltip} from 'flowbite-react';
import {MemberCountsInfo} from '../../types/api';

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
      {sortedInfo?.map(({_count}, index) => {
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
