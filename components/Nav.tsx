'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { supabaseClient } from '@/lib/supabase';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/translate', label: 'New Translation' },
  { href: '/logs', label: 'Job Logs' },
  { href: '/about', label: 'About' },
  { href: '/account', label: 'Account' }
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const showNav = pathname !== '/login' && pathname !== '/signup' && pathname !== '/';

  if (!showNav) return null;

  async function logout() {
    await supabaseClient.auth.signOut();
    document.cookie = 'cb-access-token=; Max-Age=0; path=/';
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/dashboard" className="font-semibold text-lg">{APP_NAME}</Link>
        <nav className="flex flex-wrap items-center gap-2">
          {links.map((link) => (
            <Link
              className={cn(
                'rounded-md px-3 py-1 text-sm text-slate-300 hover:bg-slate-800',
                pathname === link.href && 'bg-slate-800 text-white'
              )}
              key={link.href}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
          <button onClick={logout} className="rounded-md border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
