import {Session} from 'next-auth';
import {checkAdminAccess} from '../utils/check-admin-access';
import {UserProfile} from './user-profile';
import {SideNav} from './side-nav';

export function Sidebar({session}: {session?: Session | null}) {
  const hasAdminAccess = checkAdminAccess(session?.user?.id);
  return (
    <div className="bg-gray-100 w-[250px] border-r border-black/10 mt-[-71px]">
      <div className="sticky top-0 min-h-screen pt-[71px]">
        <UserProfile session={session} />
        <SideNav hasAdminLink={hasAdminAccess} />
      </div>
    </div>
  );
}
