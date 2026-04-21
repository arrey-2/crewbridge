'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase';

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const message = params.get('message');
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
    <div className="mx-auto max-w-md rounded-xl border border-slate-700 bg-panel p-6">
      <h1 className="mb-2 text-2xl font-semibold">CrewBridge Login</h1>
      {message && <p className="mb-3 text-amber-400">{message}</p>}
      <form className="space-y-3" onSubmit={onSubmit}>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" />
        <button className="w-full rounded-md bg-amber-500 px-4 py-2 font-semibold text-black">Login</button>
      </form>
      {error && <p className="mt-2 text-red-400">{error}</p>}
      <button onClick={demoMode} className="mt-4 w-full rounded-md border border-slate-600 px-4 py-2">
        Demo Mode
      </button>
      <p className="mt-4 text-sm text-slate-400">
        No account? <Link className="text-amber-400" href="/signup">Create one</Link>
      </p>
    </div>
  );
}
