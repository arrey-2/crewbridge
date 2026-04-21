'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { useLanguage } from '@/components/LanguageProvider';

export default function AccountPage() {
  const { t } = useLanguage();
  const [data, setData] = useState({ email: '', trade: '', daily: 0, remaining: 20 });
  const router = useRouter();

  useEffect(() => {
    const isDemo = document.cookie.includes('cb-demo=1');
    if (isDemo) { setData({ email: 'demo@crewbridge.local', trade: 'Plumbing', daily: 3, remaining: 17 }); return; }
    (async () => {
      const { data: auth } = await supabaseClient.auth.getUser();
      if (!auth.user) return;
      const today = new Date().toISOString().slice(0, 10);
      const { data: usage } = await supabaseClient.from('usage').select('translation_count').eq('user_id', auth.user.id).eq('date', today).maybeSingle();
      const { data: profile } = await supabaseClient.from('profiles').select('trade').eq('id', auth.user.id).maybeSingle();
      const daily = usage?.translation_count ?? 0;
      setData({ email: auth.user.email ?? '', trade: profile?.trade ?? 'Not set', daily, remaining: Math.max(0, 20 - daily) });
    })();
  }, []);

  async function logout() {
    await supabaseClient.auth.signOut();
    document.cookie = 'cb-access-token=; Max-Age=0; path=/';
    document.cookie = 'cb-demo=; Max-Age=0; path=/';
    router.push('/login');
  }

  return (
    <div className="mx-auto max-w-2xl glass p-6">
      <h1 className="text-2xl font-semibold">{t('account_title')}</h1>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4"><p className="text-xs text-slate-400">Email</p><p>{data.email}</p></div>
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4"><p className="text-xs text-slate-400">Trade</p><p>{data.trade}</p></div>
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4"><p className="text-xs text-slate-400">Daily usage</p><p>{data.daily} / 20</p></div>
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4"><p className="text-xs text-slate-400">Remaining</p><p>{data.remaining}</p></div>
      </div>
      <button onClick={logout} className="mt-5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-2 font-semibold">Logout</button>
    </div>
  );
}
