'use client';
import {Table, Button} from 'flowbite-react';
import {Sparklines, SparklinesBars} from 'react-sparklines';
import {useMemo, useState} from 'react';
import {PaymentStatus} from '@prisma/client';
import {useGetData} from '../hooks/use-get-data';
import {ErrorDetails} from '../common/error-details';
import {SuperadminResponse, SuperadminResponseUser} from '../../types/api';
import {Spinner} from '../common/spinner';
import {formatDateTime} from '../../utils/date';
import {formatTrialEnd} from '../../utils/format-trial-end';
import {MemberDots} from './member-dots';

function DomainInfoCard({
  title,
  value,
  total,
}: {
  title: string;
  value: number | undefined | null;
  total: number | null | undefined;
}) {
  const percentage = value && total ? ((value / total) * 100).toFixed(2) : 0;
  return (
    <div className="border border-gray-200 flex flex-col items-center justify-center p-6 rounded-md">
      <div className="font-bold">{title}</div>
      <div>{value}</div>
      <div className="text-gray-400 ml-2 text-12">({percentage}%)</div>
    </div>
  );
}

function Title({children}: {children: React.ReactNode}) {
  return <h2 className="text-20 mb-2">{children}</h2>;
}

enum TableTabs {
  ALL,
  ACTIVATED,
  PAYING,
  EMPTY,
  CANCELLED,
}

export function Superadmin() {
  const {data, error, isLoading} = useGetData<SuperadminResponse>('/api/superadmin');
  const [activeTab, setActiveTab] = useState<TableTabs>(TableTabs.ACTIVATED);

  const userTabsData = useMemo(() => {
    if (!data?.users) {
      return null;
    }

    return {
      [TableTabs.ALL]: data.users,
      [TableTabs.ACTIVATED]: data.users.filter((user) => user.member.length > 0),
      [TableTabs.PAYING]: data.users.filter(
        (user) => user.product && user?.paymentStatus === PaymentStatus.ACTIVE
      ),
      [TableTabs.CANCELLED]: data.users.filter(
        (user) => user.product && user?.paymentStatus === PaymentStatus.CANCELLED
      ),
      [TableTabs.EMPTY]: data.users.filter((user) => !user.member?.length),
    };
  }, [data]);

  const filteredUsers: SuperadminResponseUser[] | undefined | null = useMemo(() => {
    if (!data?.users) {
      return null;
    }

    switch (activeTab) {
      case TableTabs.ACTIVATED:
        return userTabsData?.[TableTabs.ACTIVATED];
      case TableTabs.PAYING:
        return userTabsData?.[TableTabs.PAYING];
      case TableTabs.CANCELLED:
        return userTabsData?.[TableTabs.CANCELLED];
      case TableTabs.EMPTY:
        return userTabsData?.[TableTabs.EMPTY];
      case TableTabs.ALL:
      default:
        return userTabsData?.[TableTabs.ALL];
    }
  }, [activeTab, userTabsData]);

  return (
    <div>
      {error && <ErrorDetails error={error} />}

      {isLoading && (
        <div>
          <Spinner />
        </div>
      )}

      {Boolean(data) && (
        <>
          <div>
            <div className="flex justify-end mb-3 gap-4">
              <Button.Group>
                <Button
                  size="xs"
                  color={activeTab === TableTabs.ALL ? 'success' : 'gray'}
                  onClick={() => setActiveTab(TableTabs.ALL)}
                >
                  All ({userTabsData?.[TableTabs.ALL]?.length})
                </Button>
                <Button
                  size="xs"
                  color={activeTab === TableTabs.ACTIVATED ? 'success' : 'gray'}
                  onClick={() => setActiveTab(TableTabs.ACTIVATED)}
                >
                  Activated ({userTabsData?.[TableTabs.ACTIVATED]?.length})
                </Button>
                <Button
                  size="xs"
                  color={activeTab === TableTabs.PAYING ? 'success' : 'gray'}
                  onClick={() => setActiveTab(TableTabs.PAYING)}
                >
                  Paying ({userTabsData?.[TableTabs.PAYING]?.length})
                </Button>
                <Button
                  size="xs"
                  color={activeTab === TableTabs.CANCELLED ? 'success' : 'gray'}
                  onClick={() => setActiveTab(TableTabs.CANCELLED)}
                >
                  Cancelled ({userTabsData?.[TableTabs.CANCELLED]?.length})
                </Button>
                <Button
                  size="xs"
                  color={activeTab === TableTabs.EMPTY ? 'success' : 'gray'}
                  onClick={() => setActiveTab(TableTabs.EMPTY)}
                >
                  Empty ({userTabsData?.[TableTabs.EMPTY]?.length})
                </Button>
              </Button.Group>
            </div>
            <div className="overflow-x-auto max-h-[600px] shadow-lg">
              <Table className="text-12">
                <Table.Head>
                  <Table.HeadCell>№</Table.HeadCell>
                  <Table.HeadCell>Name</Table.HeadCell>
                  <Table.HeadCell>Email</Table.HeadCell>
                  <Table.HeadCell>Created</Table.HeadCell>
                  <Table.HeadCell>TrialEnds</Table.HeadCell>
                  <Table.HeadCell>Product</Table.HeadCell>
                  <Table.HeadCell>Members</Table.HeadCell>
                  <Table.HeadCell>7-day Usage</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y text-12">
                  {filteredUsers?.map((user, index) => (
                    <Table.Row key={user.id}>
                      <Table.Cell>{filteredUsers?.length - index}</Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2 ">
                          {user.image && (
                            <img
                              width={28}
                              height={28}
                              src={user.image}
                              className="rounded-full w-[28px] h-[28px]"
                            />
                          )}
                          {user.name}
                        </div>
                      </Table.Cell>
                      <Table.Cell>{user.email}</Table.Cell>
                      <Table.Cell>{formatDateTime(user.createdAt)}</Table.Cell>
                      <Table.Cell>{formatTrialEnd(user.trialEndsAt)}</Table.Cell>
                      <Table.Cell>{user?.product}</Table.Cell>
                      <Table.Cell className="max-w-[120px] overflow-x-auto">
                        <MemberDots membersInfo={user?.member} />
                      </Table.Cell>
                      <Table.Cell>
                        {user?.member?.map((info, idx) => {
                          return (
                            <div key={idx} className="mb-0.5">
                              <Sparklines
                                data={info.activityTimeByDates.map((a) => a.activityTime)}
                                svgHeight={15}
                                svgWidth={120}
                              >
                                <SparklinesBars style={{fill: '#4a9ec2'}} />
                              </Sparklines>
                            </div>
                          );
                        })}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>

          <div className="mt-8">
            <Title>Domains count</Title>
            <div className="flex gap-2">
              <DomainInfoCard
                title="Classified"
                value={data?.domains?.classified}
                total={data?.domains?.total}
              />
              <DomainInfoCard
                title="Unclassified"
                value={data?.domains?.unclassified}
                total={data?.domains?.total}
              />
              <DomainInfoCard
                title="Unknown"
                value={data?.domains?.unknown}
                total={data?.domains?.total}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
