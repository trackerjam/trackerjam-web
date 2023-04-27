import Head from 'next/head';
import {HeadingSmall as Title, LabelSmall as Subtitle} from 'baseui/typography';
import {TableBuilder, TableBuilderColumn} from 'baseui/table-semantic';
import {Button, KIND as ButtonKind, SIZE as ButtonSize} from 'baseui/button';
import {Tag, KIND} from 'baseui/tag';
import copy from 'copy-to-clipboard';

import {useStyletron} from 'baseui';
import {useMemo} from 'react';
import {BsPlusCircle} from 'react-icons/bs';
import {useRouter} from 'next/router';
import type {Member, Team} from '@prisma/client';
import {useGetData} from '../hooks/use-get-data';
import {DEFAULT_TEAM_NAME} from '../../const/team';
import {ErrorDetails} from '../common/error-details';
import {TableSkeleton} from './table-skeleton';
import {CopyableUuid} from './copyable-uuid';

export function Team() {
  const [css, theme] = useStyletron();
  const {data, isLoading, error} = useGetData<Array<Team & {members: Member[]}>>('/api/team');
  const router = useRouter();

  const tableBlockStyle = css({
    padding: theme.sizing.scale400,
    boxShadow: theme.lighting.shadow400,
    borderRadius: '10px',
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
    router.push('/team/add');
  };

  return (
    <div>
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

      <div className={tableBlockStyle}>
        {isLoading && <TableSkeleton />}
        {!isLoading && (
          <TableBuilder
            data={teamData}
            overrides={{
              TableBodyRow: {
                style: {
                  ':hover': {
                    backgroundColor: 'transparent',
                  },
                },
              },
            }}
            emptyMessage={
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.sizing.scale400,
                })}
              >
                <span>No team members yet</span>
                <Button
                  kind={ButtonKind.secondary}
                  size={ButtonSize.mini}
                  startEnhancer={BsPlusCircle}
                  onClick={addMemberClickHandler}
                >
                  Add
                </Button>
              </div>
            }
          >
            <TableBuilderColumn<Member> header="Name">
              {(row) => {
                return <div>{row.name}</div>;
              }}
            </TableBuilderColumn>

            <TableBuilderColumn<Member> header="Title">
              {(row) => {
                return <div>{row.title}</div>;
              }}
            </TableBuilderColumn>

            <TableBuilderColumn<Member> header="Token">
              {(row) => {
                return <CopyableUuid uuid={row.token} />;
              }}
            </TableBuilderColumn>

            <TableBuilderColumn<Member> header="Description">
              {(row) => row.description?.slice(0, 80) || '-'}
            </TableBuilderColumn>

            <TableBuilderColumn<Member> header="Status">
              {(row) => (
                <Tag kind={KIND.blue} closeable={false}>
                  {row.status}
                </Tag>
              )}
            </TableBuilderColumn>
          </TableBuilder>
        )}
      </div>
    </div>
  );
}
