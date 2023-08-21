'use client';

import clsx from 'clsx';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

export function SideNavLink({title, itemId}: {title: React.ReactNode; itemId: string}) {
  const pathname = usePathname();
  const isActive = pathname?.startsWith(itemId);

  return (
    <Link
      className={clsx(
        'p-3 pl-6 inline-flex w-full items-center border-r-4 transition-colors duration-200 hover:bg-gray-85',
        isActive ? 'border-blue-100 bg-gray-85' : 'border-transparent'
      )}
      href={itemId}
    >
      {title}
    </Link>
  );
}
