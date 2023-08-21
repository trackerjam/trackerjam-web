import {getServerSession} from 'next-auth';
import {Header} from '../../components/header';
import {Sidebar} from '../../components/sidebar';

import {authOptions} from '../api/auth/[...nextauth]/route';
import Provider from './provider';

async function Layout({children}: {children: React.ReactNode}) {
  const session = await getServerSession(authOptions);

  return (
    <Provider>
      <Header />
      <main className="flex min-h-screen">
        <Sidebar session={session} />
        <div className="flex grow flex-col p-12 pb-2.5">{children}</div>
      </main>
    </Provider>
  );
}

export default Layout;
