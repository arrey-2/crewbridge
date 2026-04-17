'use client';

import { usePathname } from 'next/navigation';

export function DemoBanner() {
  const pathname = usePathname();
  const isDemo = typeof document !== 'undefined' && document.cookie.includes('cb-demo=1');

  if (!isDemo || pathname === '/login' || pathname === '/signup' || pathname === '/') return null;

  return <div className="bg-amber-500 px-4 py-2 text-center font-semibold text-black">DEMO MODE</div>;
}
