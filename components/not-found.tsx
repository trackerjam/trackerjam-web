import React from 'react';
import {LabelLarge} from 'baseui/typography';
import Link from 'next/link';
import {Block} from 'baseui/block';
import Head from 'next/head';

export function NotFound() {
  return (
    <Block margin="20px">
      <Head>
        <title>Page Not Found</title>
      </Head>
      <LabelLarge marginBottom="15px">404 :: Page not found</LabelLarge>
      <Link href="/">Got to Home</Link>
    </Block>
  );
}
