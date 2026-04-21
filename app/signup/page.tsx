'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase';
import { useLanguage } from '@/components/LanguageProvider';

export default function SignupPage() {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (password.length < 8 || !/\d/.test(password)) {
      setIsError(true);
      setMessage('Password must be at least 8 characters and include one number.');
      return;
    }
    if (password !== confirmPassword) {
      setIsError(true);
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
        data: { full_name: fullName }
      }
    });
    setLoading(false);

    if (error) {
      setIsError(true);
      setMessage(error.message || 'Signup is temporarily unavailable. Please try again.');
      return;
    }

    setMessage('Check your email to verify your account before logging in.');
  }

  return (
    <div className="mx-auto max-w-md panel p-8">
      <h1 className="mb-2 text-3xl font-semibold">{t('signup_title')}</h1>
      <p className="mb-6 text-slate-400">Create your secure CrewBridge workspace.</p>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input type="text" required placeholder={t('auth_full_name')} value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full" />
        <input type="email" required placeholder={t('auth_email')} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" />
        <input type="password" required placeholder={t('auth_password')} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" />
        <input type="password" required placeholder={t('auth_confirm_password')} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full" />
        <button disabled={loading} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">{loading ? t('auth_creating') : t('auth_create_account')}</button>
      </form>
      {message && <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${isError ? 'border border-red-300/30 bg-red-400/10 text-red-200' : 'border border-emerald-300/30 bg-emerald-400/10 text-emerald-200'}`}>{message}</p>}
      <p className="mt-4 text-sm text-slate-400">
        {t('auth_have_account')} <Link className="text-violet-300" href="/login">{t('nav_login')}</Link>
      </p>
    </div>
  );
}
