import Head from 'next/head';
import {LabelLarge as Title, LabelSmall as Subtitle} from 'baseui/typography';

export function Team() {
  return (
    <div>
      <Head>
        <title>Team</title>
      </Head>

      <Title marginBottom="scale600">Team</Title>

      <Subtitle>The page is under development</Subtitle>
    </div>
  );
}
