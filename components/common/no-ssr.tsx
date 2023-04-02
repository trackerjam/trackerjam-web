import dynamic from 'next/dynamic';
import React from 'react';
const NonSSRWrapper = ({children}: {children: JSX.Element}) => (
  <React.Fragment>{children}</React.Fragment>
);
export const NoSsr = dynamic(() => Promise.resolve(NonSSRWrapper), {
  ssr: false,
});
