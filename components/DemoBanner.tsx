'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function DemoBanner() {
  const pathname = usePathname();
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(document.cookie.includes('cb-demo=1'));
  }, [pathname]);

  if (!isDemo || pathname === '/login' || pathname === '/signup' || pathname === '/') return null;

  return (
    <div className="border-b border-amber-300/20 bg-gradient-to-r from-amber-400/90 to-orange-500/90 px-4 py-2 text-center text-sm font-semibold text-slate-900">
      DEMO MODE • Hardcoded sample data, zero live API calls.
    </div>
  );
}
