import Head from 'next/head';
import {HeadingSmall as Title, LabelXSmall as Subtitle} from 'baseui/typography';
import {TableBuilder, TableBuilderColumn} from 'baseui/table-semantic';
import {Button, KIND as ButtonKind, SIZE as ButtonSize} from 'baseui/button';
import {useStyletron} from 'baseui';
import {useEffect, useState} from 'react';
import {BiLinkExternal} from 'react-icons/bi';
import {BsPlusCircle} from 'react-icons/bs';
import {useRouter} from 'next/router';
import {TableSkeleton} from './table-skeleton';

// TODO add table types

export function Team() {
  const [css, theme] = useStyletron();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }, []);

  const tableBlockStyle = css({
    padding: theme.sizing.scale400,
    boxShadow: theme.lighting.shadow400,
    borderRadius: '10px',
  });

  const buttonsWrapperStyle = css({
    display: 'flex',
    gap: theme.sizing.scale200,
  });

  const buttonsBlock = css({
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: theme.sizing.scale600,
  });

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
            data={[]}
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
            <TableBuilderColumn header="Token">
              {(row) => {
                return <div>{row.name}</div>;
              }}
            </TableBuilderColumn>
            <TableBuilderColumn header="Description">
              {(row) => row.description?.slice(0, 80) || '-'}
            </TableBuilderColumn>

            <TableBuilderColumn header="Status">{(row) => row.status}</TableBuilderColumn>

            <TableBuilderColumn header="Actions">
              {(row) => {
                return (
                  <div className={buttonsWrapperStyle}>
                    <Button
                      kind={ButtonKind.secondary}
                      size={ButtonSize.mini}
                      $as="a"
                      href={`/subscribe/${row.id}`}
                      target="_blank"
                      rel="noopener"
                      endEnhancer={<BiLinkExternal title="" />}
                    >
                      View
                    </Button>
                    <Button kind={ButtonKind.secondary} size={ButtonSize.mini}>
                      Edit
                    </Button>
                    <Button kind={ButtonKind.secondary} size={ButtonSize.mini}>
                      Archive
                    </Button>
                  </div>
                );
              }}
            </TableBuilderColumn>
          </TableBuilder>
        )}
      </div>
    </div>
  );
}
