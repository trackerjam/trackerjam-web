import {Metadata} from 'next';
import {getServerSession} from 'next-auth';
import {notFound} from 'next/navigation';
import {checkAdminAccess} from '../../../utils/check-admin-access';
import {authOptions} from '../../api/auth/[...nextauth]/route';
import {Superadmin} from '../../../components/superadmin/superadmin';

export const metadata: Metadata = {
  title: 'Superadmin - Trackerjam',
};

async function SuperadminPage() {
  const session = await getServerSession(authOptions);
  const {user} = session || {};
  const hasAdminAccess = checkAdminAccess(user?.id);

  if (!hasAdminAccess || !user?.id) {
    return notFound();
  }

  return (
    <>
      <h1 className="font-bold text-28 mb-4 leading-tight">
        Super <span className="text-orange-500">Admin</span>
      </h1>

      <Superadmin />
    </>
  );
}

export default SuperadminPage;
