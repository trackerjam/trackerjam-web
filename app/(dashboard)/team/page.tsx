import {Metadata} from 'next';
import {Team} from '../../../components/team/list';
export const metadata: Metadata = {
  title: 'Team - Trackerjam',
  description: 'Browser session tracking application for efficient web activity monitoring.',
};
function TeamPage() {
  return (
    <>
      <h1 className="font-bold text-28 mb-2 leading-tight">Team</h1>
      <Team />
    </>
  );
}

export default TeamPage;
