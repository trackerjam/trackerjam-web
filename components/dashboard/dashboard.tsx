import Head from 'next/head';
import {LabelLarge as Title, LabelSmall as Subtitle} from 'baseui/typography';

export function Dashboard() {
  return (
    <div>
      <Head>
        <title>Dashboard</title>
      </Head>

      <Title marginBottom="scale600">Dashboard</Title>

      <Subtitle>The page is under development</Subtitle>
    </div>
  );
}
