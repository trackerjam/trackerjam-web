import {Metadata} from 'next';
import React from 'react';
import {MemberForm} from '../../../../components/team/member-form/member-form';
import {BackButton} from '../../../../components/team/member-form/back-button';

export const metadata: Metadata = {
  title: 'Add Member',
};

export default function AddMemberPage() {
  return (
    <div className="flex flex-col w-[min(700px,100%)]">
      <BackButton />
      <h1 className="font-bold text-24 mb-4 leading-tight">Add a new team member</h1>
      <MemberForm />
    </div>
  );
}
