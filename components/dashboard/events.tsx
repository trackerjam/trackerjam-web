import Head from 'next/head';
import {LabelLarge as Title, LabelSmall as Subtitle} from 'baseui/typography';

export function Events() {
  return (
    <div>
      <Head>
        <title>Events</title>
      </Head>

      <Title marginBottom="scale600">Events</Title>

      <Subtitle>The page is under development</Subtitle>
    </div>
  );
}
