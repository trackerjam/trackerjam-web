import {Metadata} from 'next';
import React from 'react';
import {BackButton} from '../../../../../components/team/member-form/back-button';
import {EditMember} from '../../../../../components/team/member-form/edit-member';

export const metadata: Metadata = {
  title: 'Edit Member',
};

interface Params {
  params: {
    editingId: string;
  };
}

export default function EditMemberPage({params}: Params) {
  return (
    <div className="flex flex-col w-[min(700px,100%)]">
      <BackButton />
      <h1 className="font-bold text-24 mb-4 leading-tight">Edit team member</h1>
      <EditMember editingId={params.editingId} />
    </div>
  );
}
