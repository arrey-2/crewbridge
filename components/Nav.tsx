'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { APP_NAME } from '@/lib/constants';
import { useLanguage } from './LanguageProvider';
import { cn } from '@/lib/utils';

const protectedLinks = [
  { href: '/dashboard', key: 'nav_dashboard' as const },
  { href: '/translate', key: 'nav_translate' as const },
  { href: '/logs', key: 'nav_logs' as const },
  { href: '/account', key: 'nav_account' as const }
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLanding = pathname === '/';

  async function logout() {
    await supabaseClient.auth.signOut();
    document.cookie = 'cb-access-token=; Max-Age=0; path=/';
    document.cookie = 'cb-demo=; Max-Age=0; path=/';
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">{APP_NAME}</Link>
        <nav className="hidden items-center gap-2 md:flex">
          {!isLanding && !isAuthPage && protectedLinks.map((link) => (
            <Link key={link.href} href={link.href} className={cn('rounded-full px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white', pathname === link.href && 'bg-white/10 text-white')}>
              {t(link.key)}
            </Link>
          ))}
          <button
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-slate-200"
          >
            {lang === 'en' ? 'EN / ES' : 'ES / EN'}
          </button>
          {isLanding && (
            <>
              <Link href="/login" className="rounded-full px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10">{t('nav_login')}</Link>
              <Link href="/signup" className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20">{t('nav_signup')}</Link>
            </>
          )}
          {!isLanding && !isAuthPage && (
            <button onClick={logout} className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-1.5 text-sm font-semibold text-white">Logout</button>
          )}
        </nav>
      </div>
    </header>
  );
}
