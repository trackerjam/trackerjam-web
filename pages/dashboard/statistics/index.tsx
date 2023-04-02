import {DashboardLayout} from '../../../components/dashboard/dashboard-layout';
import {Statistics} from '../../../components/dashboard/stats/statistics';

export default function StatisticsPage() {
  return <Statistics />;
}

StatisticsPage.Layout = DashboardLayout;
