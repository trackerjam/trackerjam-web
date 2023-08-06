import {getServerSession} from 'next-auth/next';

import {redirect} from 'next/navigation';
import {Metadata} from 'next';
import {authOptions} from '../pages/api/auth/[...nextauth]';
import {Button} from '../components/common/button';

export const metadata: Metadata = {
  title: 'Trackerjam',
  description: 'Crypto Subscription as a Service',
};

const Home = async () => {
  const session = await getServerSession(authOptions);
  const hasSession = Boolean(session);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col text-white bg-black justify-center">
      <main className="flex grow flex-col justify-start items-center mt-[15%]">
        <h1 className="my-8 text-gradient text-36 leading-tight font-bold">Trackerjam</h1>

        {!hasSession && (
          <Button className="mt-6" href="/api/auth/signin" type="button" kind="secondary">
            Sign In To Try
          </Button>
        )}

        {hasSession && (
          <Button kind="secondary" disabled>
            Loading dashboard...
          </Button>
        )}
      </main>

      <footer className="flex mt-auto justify-center text-12 p-6 text-mono-800">
        Trackerjam 2023
      </footer>
    </div>
  );
};

export default Home;
