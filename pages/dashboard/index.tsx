import {DashboardLayout} from '../../components/dashboard/dashboard-layout';
import TeamPage from './team';

// Default page for "/dashboard" route
const DashboardPage = () => {
  return <TeamPage />;
};

DashboardPage.Layout = DashboardLayout;

export default DashboardPage;
