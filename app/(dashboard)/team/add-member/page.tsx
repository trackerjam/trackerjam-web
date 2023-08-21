import {Metadata} from 'next';
import {AddMember} from '../../../../components/team/add-member/add-member';

export const metadata: Metadata = {
  title: 'Add Member',
};

export default function AddMemberPage() {
  return (
    <div className="flex flex-col w-[min(700px,100%)]">
      <h1 className="font-bold text-24 mb-4 leading-tight">Add a new team member</h1>
      <AddMember />
    </div>
  );
}
