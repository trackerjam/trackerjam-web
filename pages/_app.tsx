import '../styles/globals.css';
import * as React from 'react';
import type {AppProps} from 'next/app';
import {SessionProvider} from 'next-auth/react';
import PlausibleProvider from 'next-plausible';
import {Provider as StyletronProvider} from 'styletron-react';
import {LightTheme as Theme, BaseProvider} from 'baseui';
import {styletron} from '../styletron';

type FullAppProps = {
  Component: {Layout: React.ElementType} & AppProps['Component'];
} & AppProps;

export default function App({Component, pageProps}: FullAppProps) {
  const Layout = Component.Layout || 'div';

  return (
    <SessionProvider session={pageProps.session}>
      <PlausibleProvider domain="trackerjam.com" customDomain="p.hostedapp.one">
        <StyletronProvider value={styletron}>
          <BaseProvider theme={Theme}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </BaseProvider>
        </StyletronProvider>
      </PlausibleProvider>
    </SessionProvider>
  );
}
