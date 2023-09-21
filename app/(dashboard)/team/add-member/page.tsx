import {Metadata} from 'next';
import React from 'react';
import {BiLeftArrowAlt} from 'react-icons/bi';
import {AddMember} from '../../../../components/team/add-member/add-member';

export const metadata: Metadata = {
  title: 'Add Member',
};

export default function AddMemberPage() {
  return (
    <div className="flex flex-col w-[min(700px,100%)]">
      <a
        href="/team"
        className="px-2 py-1 rounded inline-flex gap-1 items-center max-w-max bg-gray-200 text-14 text-gray-700 mb-2"
      >
        <BiLeftArrowAlt title="" />
        Back to Team
      </a>
      <h1 className="font-bold text-24 mb-4 leading-tight">Add a new team member</h1>
      <AddMember />
    </div>
  );
}
