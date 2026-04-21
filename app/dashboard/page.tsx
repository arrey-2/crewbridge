'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { EmptyState } from '@/components/EmptyState';
import { useLanguage } from '@/components/LanguageProvider';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [name, setName] = useState('CrewBridge User');
  const [stats, setStats] = useState({ daily: 0, remaining: 20 });
  const [recentJobs, setRecentJobs] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const isDemo = document.cookie.includes('cb-demo=1');
    if (isDemo) {
      setName('Demo Foreman');
      setRecentJobs([{ id: '1', name: 'Riverfront Apartments - Plumbing Rough-In' }, { id: '2', name: 'Westgate School - Electrical Panel Upgrade' }]);
      setStats({ daily: 3, remaining: 17 });
      return;
    }

    (async () => {
      const { data: auth } = await supabaseClient.auth.getUser();
      const user = auth.user;
      if (!user) return;

      const { data: profile } = await supabaseClient.from('profiles').select('full_name,onboarding_complete').eq('id', user.id).single();
      if (profile?.full_name) setName(profile.full_name);
      if (profile && !profile.onboarding_complete) {
        window.location.href = '/onboarding';
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const { data: usage } = await supabaseClient.from('usage').select('translation_count').eq('user_id', user.id).eq('date', today).maybeSingle();
      const daily = usage?.translation_count ?? 0;
      setStats({ daily, remaining: Math.max(0, 20 - daily) });

      const { data: jobs } = await supabaseClient.from('jobs').select('id,name').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5);
      setRecentJobs(jobs ?? []);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <section className="glass p-6">
        <h1 className="text-3xl font-semibold">{t('dashboard_title')}</h1>
        <p className="mt-1 text-slate-300">{name}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4"><p className="text-xs text-slate-400">Daily usage</p><p className="text-2xl font-semibold">{stats.daily}</p></div>
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4"><p className="text-xs text-slate-400">Remaining today</p><p className="text-2xl font-semibold">{stats.remaining}</p></div>
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4"><p className="text-xs text-slate-400">Safety alerts</p><p className="text-2xl font-semibold text-amber-300">Live</p></div>
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4"><p className="text-xs text-slate-400">Status</p><p className="text-2xl font-semibold text-emerald-300">Ready</p></div>
        </div>
        <div className="mt-5 flex gap-3">
          <Link href="/translate" className="rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-2 font-semibold">{t('cta_primary')}</Link>
          <Link href="/logs" className="rounded-xl border border-white/20 px-4 py-2">{t('nav_logs')}</Link>
        </div>
      </section>

      <section className="glass p-6">
        <h2 className="mb-3 text-xl font-semibold">Recent activity</h2>
        {recentJobs.length === 0 ? (
          <EmptyState message="No jobs yet. Start your first translation to create a project activity trail." ctaHref="/translate" ctaLabel="New Translation" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {recentJobs.map((job) => <div key={job.id} className="rounded-xl border border-white/10 bg-slate-900/50 p-4">{job.name}</div>)}
          </div>
        )}
      </section>
    </div>
  );
}
