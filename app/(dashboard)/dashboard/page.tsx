import {Metadata} from 'next';
import {Dashboard} from '../../../components/dashboard/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard - Trackerjam',
  description: 'Browser session tracking application for efficient web activity monitoring.',
};

function DashboardPage() {
  return (
    <div className="p-6 pb-2.5">
      <h2 className="font-bold text-28 mb-4 leading-tight">Dashboard</h2>
      <Dashboard />
    </div>
  );
}

export default DashboardPage;
