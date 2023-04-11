import Head from 'next/head';
import {LabelLarge as Title, LabelSmall as Subtitle} from 'baseui/typography';

export function Statistics() {
  return (
    <div>
      <Head>
        <title>Statistics</title>
      </Head>

      <Title marginBottom="scale600">Statistics</Title>

      <Subtitle>The page is under development</Subtitle>
    </div>
  );
}
