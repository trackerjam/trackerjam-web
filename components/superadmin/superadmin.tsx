'use client';
import {Table} from 'flowbite-react';
import {Sparklines, SparklinesBars} from 'react-sparklines';
import {useGetData} from '../hooks/use-get-data';
import {ErrorDetails} from '../common/error-details';
import {SuperadminResponse} from '../../types/api';
import {Spinner} from '../common/spinner';
import {formatDateFull} from '../../utils/date';
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

export function Superadmin() {
  const {data, error, isLoading} = useGetData<SuperadminResponse>('/api/superadmin');

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
            <Title>Users</Title>
            <div className="overflow-x-auto">
              <Table>
                <Table.Head>
                  <Table.HeadCell></Table.HeadCell>
                  <Table.HeadCell>Name</Table.HeadCell>
                  <Table.HeadCell>Email</Table.HeadCell>
                  <Table.HeadCell>CreatedAt</Table.HeadCell>
                  <Table.HeadCell>Members</Table.HeadCell>
                  <Table.HeadCell>7-day Usage</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {data?.users.map((user, index) => (
                    <Table.Row key={user.id}>
                      <Table.Cell>{index + 1}</Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2 ">
                          {user.image && (
                            <img width={28} height={28} src={user.image} className="rounded-full" />
                          )}
                          {user.name}
                        </div>
                      </Table.Cell>
                      <Table.Cell>{user.email}</Table.Cell>
                      <Table.Cell>{formatDateFull(user.createdAt)}</Table.Cell>
                      <Table.Cell>
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
