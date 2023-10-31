import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-[#eaeaea] border-b border-solid border-gray-300 p-4 text-black">
      <Link href="/" className="font-bold text-18 text-black">
        TrackerJam
      </Link>
    </header>
  );
}
