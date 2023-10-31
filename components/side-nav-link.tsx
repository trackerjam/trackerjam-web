'use client';

import clsx from 'clsx';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {BiLinkExternal} from 'react-icons/bi';

export function SideNavLink({
  title,
  itemId,
  isTargetBlank,
  isExternal,
}: {
  title: React.ReactNode;
  itemId: string;
  isTargetBlank?: boolean;
  isExternal?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname?.startsWith(itemId);

  return (
    <Link
      className={clsx(
        'p-3 pl-6 inline-flex w-full items-center border-r-4 transition-colors duration-200 hover:bg-gray-85 group gap-4',
        isActive ? 'border-blue-600 bg-gray-85' : 'border-transparent'
      )}
      href={itemId}
      target={isTargetBlank ? '_blank' : '_self'}
    >
      {title}

      {isExternal && (
        <BiLinkExternal title="External link" className="hidden group-hover:block" color="#999" />
      )}
    </Link>
  );
}
