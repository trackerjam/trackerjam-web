import Head from 'next/head';
import {LabelLarge as Title, LabelSmall as Subtitle} from 'baseui/typography';
import {useRouter} from 'next/router';

export function MemberStatistics() {
  const {query} = useRouter();

  return (
    <div>
      <Head>
        <title>Statistics</title>
      </Head>

      <Title marginBottom="scale600">Statistics</Title>

      <Subtitle>Stats for ID: {query.id}</Subtitle>
    </div>
  );
}
