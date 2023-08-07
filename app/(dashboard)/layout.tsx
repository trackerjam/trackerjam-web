import {getServerSession} from 'next-auth';
import {Header} from '../../components/header';
import {Sidebar} from '../../components/sidebar';
import {authOptions} from '../../pages/api/auth/[...nextauth]';
import Provider from './provider';

async function Layout({children}: {children: React.ReactNode}) {
  const session = await getServerSession(authOptions);

  return (
    <Provider>
      <Header />
      <main className="flex min-h-screen">
        <Sidebar session={session} />
        {/* <DashboardWrapper> */}
        <div className="">{children}</div>
        {/* </DashboardWrapper> */}
      </main>
    </Provider>
  );
}

export default Layout;
