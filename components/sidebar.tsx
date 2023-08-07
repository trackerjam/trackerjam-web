import {UserProfile} from './user-profile';
import {SideNav} from './side-nav';

export function Sidebar({session}: {session: any}) {
  return (
    <div className="bg-gray-100 w-[280px] border-r border-black/10">
      <UserProfile session={session} />
      <SideNav />
    </div>
  );
}
