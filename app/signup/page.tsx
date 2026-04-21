'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase';
import { useLanguage } from '@/components/LanguageProvider';

export default function SignupPage() {
  const { t } = useLanguage();
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
      options: { emailRedirectTo: `${window.location.origin}/onboarding`, captchaToken }
    });

    if (error) {
      setMessage('Signup unavailable right now. Please try again.');
      return;
    }

    setMessage('Check your email to verify your account before logging in.');
  }

  return (
    <div className="mx-auto max-w-md glass p-8">
      <h1 className="mb-2 text-3xl font-semibold">{t('signup_title')}</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" />
        <input type="text" required placeholder="CAPTCHA token" value={captchaToken} onChange={(e) => setCaptchaToken(e.target.value)} className="w-full" />
        <button className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-2.5 font-semibold text-white">{t('nav_signup')}</button>
      </form>
      {message && <p className="mt-3 text-sm text-slate-300">{message}</p>}
      <p className="mt-4 text-sm text-slate-400">
        Have an account? <Link className="text-violet-300" href="/login">Login</Link>
      </p>
    </div>
  );
}
