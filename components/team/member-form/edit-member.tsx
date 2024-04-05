'use client';
import {useGetData} from '../../hooks/use-get-data';
import {EditMemberDataType} from '../../../types/member';
import {ErrorDetails} from '../../common/error-details';
import {Spinner} from '../../common/spinner';
import {MemberForm} from './member-form';

interface Params {
  editingId: string;
}

export function EditMember({editingId}: Params) {
  const {
    data: editingMember,
    isLoading,
    error,
  } = useGetData<EditMemberDataType>(`/api/member/${editingId}`);

  return (
    <>
      {error && <ErrorDetails error={error} />}
      {isLoading && <Spinner />}
      {Boolean(editingMember) && <MemberForm editingMember={editingMember} />}
    </>
  );
}
