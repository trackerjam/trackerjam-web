import {getServerSession} from 'next-auth';
import {redirect} from 'next/navigation';
import {Header} from '../../components/header/header';
import {Sidebar} from '../../components/sidebar';

import {authOptions} from '../api/auth/[...nextauth]/route';
import Provider from './provider';

// To make sure this page remains dynamic.
export const dynamic = 'force-dynamic';

async function Layout({children}: {children: React.ReactNode}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
    return null;
  }

  return (
    <Provider>
      <Header />
      <main className="flex min-h-screen">
        <Sidebar session={session} />
        <div className="flex grow flex-col p-8 pb-2.5">{children}</div>
      </main>
    </Provider>
  );
}

export default Layout;
