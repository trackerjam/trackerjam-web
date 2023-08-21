import {Metadata} from 'next';
import {Dashboard} from '../../../components/dashboard/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard - Trackerjam',
  description: 'Browser session tracking application for efficient web activity monitoring.',
};

function DashboardPage() {
  return (
    <>
      <h1 className="font-bold text-28 mb-4 leading-tight">Dashboard</h1>
      <Dashboard />
    </>
  );
}

export default DashboardPage;
