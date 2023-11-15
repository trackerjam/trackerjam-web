import Link from 'next/link';
import Image from 'next/image';
import iconImage from './icon-128.png';

export function Header() {
  return (
    <header className="sticky top-0 bg-[#eaeaea] border-b border-solid border-gray-300 p-4 text-black z-50">
      <Link
        href="/"
        className="font-bold text-18 text-black inline-flex gap-2 items-end ml-3 grow-0"
      >
        <Image src={iconImage} alt="Logo" className="h-8 w-8" />
        TrackerJam
      </Link>
    </header>
  );
}
