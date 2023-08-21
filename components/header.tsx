import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-black p-4 text-white">
      <Link href="/dashboard" className="font-bold text-18 text-gradient">
        TrackerJam
      </Link>
    </header>
  );
}
