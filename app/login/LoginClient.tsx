'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase';
import { useLanguage } from '@/components/LanguageProvider';

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const message = params.get('message');
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      setError('Unable to log in. Please check your credentials.');
      return;
    }

    document.cookie = `cb-access-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24}`;
    document.cookie = 'cb-demo=; Max-Age=0; path=/';
    router.push('/dashboard');
  }

  function demoMode() {
    document.cookie = 'cb-demo=1; path=/; max-age=86400';
    document.cookie = 'cb-access-token=demo; path=/; max-age=86400';
    router.push('/dashboard');
  }

  return (
    <div className="mx-auto max-w-md glass p-8">
      <h1 className="mb-2 text-3xl font-semibold">{t('login_title')}</h1>
      <p className="mb-6 text-slate-300">CrewBridge</p>
      {message && <p className="mb-3 rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-amber-200">{message}</p>}
      <form className="space-y-3" onSubmit={onSubmit}>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" />
        <button className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-violet-500/20">{t('nav_login')}</button>
      </form>
      {error && <p className="mt-2 text-red-300">{error}</p>}
      <button onClick={demoMode} className="mt-4 w-full rounded-xl border border-white/20 px-4 py-2.5 font-medium hover:bg-white/10">
        Demo Mode
      </button>
      <p className="mt-4 text-sm text-slate-400">
        No account? <Link className="text-violet-300" href="/signup">Create one</Link>
      </p>
    </div>
  );
}
