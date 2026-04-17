'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [message, setMessage] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage('');

    if (password.length < 8 || !/\d/.test(password)) {
      setMessage('Password must be at least 8 characters and include one number.');
      return;
    }

    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
        captchaToken
      }
    });

    if (error) {
      setMessage('Signup unavailable right now. Please try again.');
      return;
    }

    setMessage('Check your email to verify your account before logging in.');
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-700 bg-panel p-6">
      <h1 className="mb-2 text-2xl font-semibold">Create CrewBridge Account</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" />
        <input
          type="text"
          required
          placeholder="CAPTCHA token"
          value={captchaToken}
          onChange={(e) => setCaptchaToken(e.target.value)}
          className="w-full"
        />
        <button className="w-full rounded-md bg-amber-500 px-4 py-2 font-semibold text-black">Sign up</button>
      </form>
      {message && <p className="mt-3 text-sm text-slate-300">{message}</p>}
      <p className="mt-4 text-sm text-slate-400">
        Have an account? <Link className="text-amber-400" href="/login">Login</Link>
      </p>
    </div>
  );
}
