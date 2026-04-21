'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';

export default function AccountPage() {
  const [data, setData] = useState({ email: '', trade: '', daily: 0, remaining: 20 });
  const router = useRouter();

  useEffect(() => {
    const isDemo = document.cookie.includes('cb-demo=1');
    if (isDemo) {
      setData({ email: 'demo@crewbridge.local', trade: 'Plumbing', daily: 3, remaining: 17 });
      return;
    }

    (async () => {
      const { data: auth } = await supabaseClient.auth.getUser();
      const user = auth.user;
      if (!user) return;
      const today = new Date().toISOString().slice(0, 10);
      const { data: usage } = await supabaseClient.from('usage').select('translation_count').eq('user_id', user.id).eq('date', today).maybeSingle();
      const { data: profile } = await supabaseClient.from('profiles').select('trade').eq('id', user.id).maybeSingle();
      const daily = usage?.translation_count ?? 0;
      setData({ email: user.email ?? '', trade: profile?.trade ?? 'Not set', daily, remaining: Math.max(0, 20 - daily) });
    })();
  }, []);

  async function logout() {
    await supabaseClient.auth.signOut();
    document.cookie = 'cb-access-token=; Max-Age=0; path=/';
    document.cookie = 'cb-demo=; Max-Age=0; path=/';
    router.push('/login');
  }

  return (
    <div className="max-w-xl space-y-3 rounded-lg border border-slate-700 bg-panel p-6">
      <h1 className="text-2xl font-semibold">Account</h1>
      <p><span className="text-slate-400">Email:</span> {data.email}</p>
      <p><span className="text-slate-400">Selected trade:</span> {data.trade}</p>
      <p><span className="text-slate-400">Daily usage:</span> {data.daily} / 20</p>
      <p><span className="text-slate-400">Remaining today:</span> {data.remaining}</p>
      <button onClick={logout} className="rounded-md bg-amber-500 px-4 py-2 font-semibold text-black">Logout</button>
    </div>
  );
}
