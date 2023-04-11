import Head from 'next/head';
import {LabelLarge as Title, LabelSmall as Subtitle} from 'baseui/typography';

export function Settings() {
  return (
    <div>
      <Head>
        <title>Settings</title>
      </Head>

      <Title marginBottom="scale600">Settings</Title>

      <Subtitle>The page is under development</Subtitle>
    </div>
  );
}
