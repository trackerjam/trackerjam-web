'use client';
import {Spinner, Table} from 'flowbite-react';
import {format} from 'date-fns';
import {useGetData} from '../hooks/use-get-data';
import {ErrorDetails} from '../common/error-details';
import {SuperadminResponse} from '../../types/api';

const formatDate = (date: string | Date | null) => {
  if (!date) {
    return '';
  }
  const d = new Date(date);
  return format(d, 'dd MMM yyyy @ HH:mm');
};

export function Superadmin() {
  const {data, error, isLoading} = useGetData<SuperadminResponse>('/api/superadmin');

  // TODO Show total members vs active members, or color dots for active/inactive

  return (
    <div>
      {error && <ErrorDetails error={error} />}

      {isLoading && (
        <div>
          <Spinner />
        </div>
      )}

      {Boolean(data) && (
        <div>
          <h2 className="text-20 mb-2">Users</h2>
          <div className="overflow-x-auto">
            <Table>
              <Table.Head>
                <Table.HeadCell></Table.HeadCell>
                <Table.HeadCell>Name</Table.HeadCell>
                <Table.HeadCell>Email</Table.HeadCell>
                <Table.HeadCell>Email Verified</Table.HeadCell>
                <Table.HeadCell>Members</Table.HeadCell>
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
                    <Table.Cell>{formatDate(user.emailVerified)}</Table.Cell>
                    <Table.Cell>{user._count?.member}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
