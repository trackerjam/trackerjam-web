'use client';

import {SessionProvider} from 'next-auth/react';
import {Provider as StyletronProvider} from 'styletron-react';
import {styletron} from '../../styletron';

function Provider({children}: {children: React.ReactNode}) {
  return (
    <SessionProvider>
      <StyletronProvider value={styletron}>{children}</StyletronProvider>
    </SessionProvider>
  );
}

export default Provider;
