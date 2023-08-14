import {Metadata} from 'next';
import {Team} from '../../../components/team/list';
export const metadata: Metadata = {
  title: 'Team - Trackerjam',
  description: 'Browser session tracking application for efficient web activity monitoring.',
};
function TeamPage() {
  return (
    <>
      <h2 className="text-24 leading-snug font-bold">Team</h2>
      <p className="mt-4 text-14 font-medium">List of your team members & contractors</p>
      <Team />
    </>
  );
}

export default TeamPage;
