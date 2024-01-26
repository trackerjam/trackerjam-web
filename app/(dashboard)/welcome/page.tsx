import {Metadata} from 'next';
import {Welcome} from '../../../components/welcome/welcome';
export const metadata: Metadata = {
  title: 'Team - Trackerjam',
  description: 'Browser session tracking application for efficient web activity monitoring.',
};
function WelcomePage() {
  return (
    <>
      <Welcome />
    </>
  );
}

export default WelcomePage;
