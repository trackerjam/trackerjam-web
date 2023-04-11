import {Layout} from '../../components/layout';
import {Dashboard} from '../../components/dashboard/dashboard';

// Default page for "/dashboard" route
const DashboardPage = () => {
  return <Dashboard />;
};

DashboardPage.Layout = Layout;

export default DashboardPage;
