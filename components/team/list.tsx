import Head from 'next/head';
import {HeadingSmall as Title, LabelSmall as Subtitle} from 'baseui/typography';
import {Button} from 'baseui/button';

import {useStyletron} from 'baseui';
import {useMemo} from 'react';
import {BsPlusCircle} from 'react-icons/bs';
import {useRouter} from 'next/router';
import type {Member, Team} from '@prisma/client';
import {toaster, ToasterContainer, PLACEMENT} from 'baseui/toast';
import {useGetData} from '../hooks/use-get-data';
import {DEFAULT_TEAM_NAME} from '../../const/team';
import {ErrorDetails} from '../common/error-details';
import {ListSkeleton} from './list-skeleton';
import {MemberCard} from './member-card';

export const GRID_TEMPLATE = 'repeat(auto-fit, minmax(250px, 350px))';

export function Team() {
  const [css, theme] = useStyletron();
  const {data, isLoading, error, update} =
    useGetData<Array<Team & {members: Member[]}>>('/api/team');
  const router = useRouter();

  const cardsBlockWrapper = css({
    display: 'grid',
    gridTemplateColumns: GRID_TEMPLATE,
    gap: theme.sizing.scale600,
    marginBottom: theme.sizing.scale800,
  });

  const buttonsBlock = css({
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: theme.sizing.scale600,
  });

  const teamData = useMemo(() => {
    if (data) {
      // We currently support the default team only
      return data.find(({name}) => name === DEFAULT_TEAM_NAME)?.members;
    }
  }, [data]);

  const addMemberClickHandler = () => {
    router.push('/team/add-member');
  };

  const handleCardDelete = () => {
    update();
  };

  const handleCopyClick = (shortToken: string) => {
    toaster.info(
      <span>
        Key &quot;<code>{shortToken}</code>&quot; copied
      </span>
    );
  };

  return (
    <div>
      <ToasterContainer placement={PLACEMENT.topRight} autoHideDuration={1500}>
        <Head>
          <title>Team</title>
        </Head>

        <Title marginBottom="scale600" marginTop="0">
          Team
        </Title>
        <Subtitle>List of your team members & contractors</Subtitle>

        {error && <ErrorDetails error={error} />}

        <div className={buttonsBlock}>
          <Button
            startEnhancer={BsPlusCircle}
            onClick={addMemberClickHandler}
            overrides={{
              BaseButton: {
                style: {
                  backgroundColor: theme.colors.backgroundPositive,
                },
              },
            }}
          >
            Add member
          </Button>
        </div>

        {isLoading && <ListSkeleton />}
        {!isLoading && (
          <div className={cardsBlockWrapper}>
            {teamData?.map((userData) => {
              return (
                <MemberCard
                  key={userData.id}
                  data={userData}
                  onDelete={handleCardDelete}
                  onCopy={handleCopyClick}
                />
              );
            })}
          </div>
        )}
      </ToasterContainer>
    </div>
  );
}
