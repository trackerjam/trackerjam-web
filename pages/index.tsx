import {useStyletron} from 'baseui';
import {Button} from 'baseui/button';
import Head from 'next/head';
import Link from 'next/link';
import {HeadingXLarge} from 'baseui/typography';
import {useSession} from 'next-auth/react';
import {useRouter} from 'next/router';
// eslint-disable-next-line camelcase
import {unstable_getServerSession} from 'next-auth/next';
import {GetServerSidePropsContext} from 'next/types';
import {useEffect} from 'react';
import {authOptions} from './api/auth/[...nextauth]';

export default function Home() {
  const {data} = useSession();
  const router = useRouter();
  const hasSession = Boolean(data);
  const [css, theme] = useStyletron();

  const pageWrapperStyle = css({
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.colors.black,
    color: theme.colors.white,
    justifyContent: 'center',
  });

  const mainStyle = css({
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: '15%',
  });

  const footerStyle = css({
    display: 'flex',
    marginTop: 'auto',
    justifyContent: 'center',
    fontSize: '12px',
    color: theme.colors.mono800,
    padding: theme.sizing.scale800,
  });

  const highlightedWordStyle = css({
    backgroundImage: '-webkit-linear-gradient(45deg,#1dd82d,rgb(227, 141, 36) 80%)',
    backgroundClip: 'text',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
  });

  const linkStyle = css({
    marginTop: theme.sizing.scale800,
    textDecoration: 'none',
  });

  useEffect(() => {
    if (data?.user) {
      router.push('/dashboard');
    }
  }, [data?.user, router]);

  return (
    <div className={pageWrapperStyle}>
      <Head>
        <title>Trackerjam</title>
        <meta name="description" content="Crypto Subscription as a Service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={mainStyle}>
        <HeadingXLarge color="white">
          <span className={highlightedWordStyle}>Trackerjam</span>
        </HeadingXLarge>

        {!hasSession && (
          <Link href="/api/auth/signin" className={linkStyle}>
            <Button kind="secondary">Sign In To Try</Button>
          </Link>
        )}

        {hasSession && (
          <Button kind="secondary" disabled={true}>
            Loading dashboard...
          </Button>
        )}
      </main>

      <footer className={footerStyle}>Trackerjam 2023</footer>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      session: await unstable_getServerSession(context.req, context.res, authOptions),
    },
  };
}
