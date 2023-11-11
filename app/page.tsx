import {getServerSession} from 'next-auth/next';

import {redirect} from 'next/navigation';
import {Metadata} from 'next';

import {Button} from '../components/common/button';
import {AUTH_PAGE, DEFAULT_PAGE} from '../const/url';
import {authOptions} from './api/auth/[...nextauth]/route';

export const metadata: Metadata = {
  title: 'Trackerjam',
  description: 'Browser session tracking application for efficient web activity monitoring',
};

// To make sure this page remains dynamic.
export const dynamic = 'force-dynamic';

const Home = async () => {
  const session = await getServerSession(authOptions);
  const hasSession = Boolean(session);

  if (session?.user) {
    redirect(DEFAULT_PAGE);
  }

  if (!session?.user) {
    redirect(AUTH_PAGE);
  }

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <main className="flex grow flex-col justify-start items-center mt-[15%]">
        <h1 className="my-8 text-36 leading-tight font-bold">Trackerjam</h1>

        {!hasSession && (
          <Button className="mt-6" href={AUTH_PAGE} type="button" kind="gray">
            Sign In
          </Button>
        )}

        {hasSession && (
          <Button kind="secondary" disabled>
            Loading dashboard...
          </Button>
        )}
      </main>

      <footer className="flex mt-auto justify-center text-12 p-6 text-gray-500">
        Trackerjam 2023
      </footer>
    </div>
  );
};

export default Home;
