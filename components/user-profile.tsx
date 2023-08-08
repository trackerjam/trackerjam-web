'use client';
import Avatar from 'react-avatar';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {BsThreeDots} from 'react-icons/bs';
import {signOut} from 'next-auth/react';
import {Session} from 'next-auth';

export function UserProfile({session}: {session?: Session | null}) {
  const user = session?.user;

  return (
    <div className="flex items-center justify-between mx-2.5 mt-8 mb-2.5 rounded-xl border border-black/10 p-2">
      <div className="items-center flex flex-1 overflow-hidden gap-x-2">
        <Avatar
          size="32"
          round={true}
          email={user?.email || ''}
          className="w-8 h-8 rounded-full shrink-0"
          alt="User avatar"
        />
        <span className="text-14 whitespace-nowrap overflow-hidden text-ellipsis min-w-0 basis-full">
          {user?.email}
        </span>
      </div>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="rounded-full w-11 h-11 inline-flex hover:bg-gray-90 transition-colors duration-200 items-center justify-center outline-none bg-gray-80"
            aria-label="Open dropdown menu"
          >
            <BsThreeDots />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
            sideOffset={5}
          >
            <DropdownMenu.Item
              className="group py-2 px-3 text-14 leading-none flex items-center h-[25px] relative select-none outline-none data-[disabled]:text-gray-50 data-[disabled]:pointer-events-none data-[highlighted]:bg-gray-100 cursor-pointer transition-colors duration-200"
              onSelect={() => signOut({callbackUrl: '/'})}
            >
              Sign Out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
