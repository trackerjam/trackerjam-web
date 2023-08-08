import {Metadata} from 'next';
import {Team} from '../../../components/team/list';
export const metadata: Metadata = {
  title: 'Team - Trackerjam',
  description: 'Browser session tracking application for efficient web activity monitoring.',
};
function TeamPage() {
  return <Team />;
}

export default TeamPage;
