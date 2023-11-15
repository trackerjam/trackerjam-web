import {Session} from 'next-auth';
import {UserProfile} from './user-profile';
import {SideNav} from './side-nav';

export function Sidebar({session}: {session?: Session | null}) {
  return (
    <div className="bg-gray-100 w-[250px] border-r border-black/10 mt-[-71px]">
      <div className="sticky top-0 min-h-screen pt-[71px]">
        <UserProfile session={session} />
        <SideNav />
      </div>
    </div>
  );
}
