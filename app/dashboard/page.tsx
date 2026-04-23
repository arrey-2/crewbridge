'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { EmptyState } from '@/components/EmptyState';
import { useLanguage } from '@/components/LanguageProvider';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [name, setName] = useState('CrewBridge User');
  const [stats, setStats] = useState({ daily: 0, remaining: 20, activeJobs: 0, reports: 0 });
  const [recentJobs, setRecentJobs] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const isDemo = document.cookie.includes('cb-demo=1');
    if (isDemo) {
      setName('Demo Foreman');
      setRecentJobs([{ id: '1', name: 'Riverfront Apartments - Plumbing Rough-In' }, { id: '2', name: 'Westgate School - Electrical Panel Upgrade' }]);
      setStats({ daily: 3, remaining: 17, activeJobs: 2, reports: 2 });
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
      const { data: jobs } = await supabaseClient.from('jobs').select('id,name').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6);
      setRecentJobs(jobs ?? []);
      setStats({ daily, remaining: Math.max(0, 20 - daily), activeJobs: jobs?.length ?? 0, reports: Math.min(5, daily) });
    })();
  }, []);

  const metricCards = [
    [t('dash_translations_today'), `${stats.daily}`],
    [t('dash_active_jobs'), `${stats.activeJobs}`],
    [t('dash_pending'), '4'],
    [t('dash_alerts'), '2'],
    [t('dash_remaining'), `${stats.remaining}`],
    ['Reports generated', `${stats.reports}`]
  ];

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <p className="text-sm text-slate-400">{t('dashboard_good_morning')}</p>
        <h1 className="text-3xl font-semibold">{t('dashboard_title')} • {name}</h1>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {metricCards.map(([label, value], idx) => (
            <div key={label} className={`rounded-xl border p-4 ${idx === 0 ? 'border-violet-400/40 bg-violet-500/10' : 'border-white/10 bg-white/[0.02]'}`}>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-1 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/translate" className="btn-primary">{t('cta_primary')}</Link>
          <Link href="/templates" className="btn-secondary">{t('dash_open_templates')}</Link>
          <Link href="/logs" className="btn-secondary">{t('nav_logs')}</Link>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel p-6">
          <h2 className="mb-3 text-xl font-semibold">{t('dash_recent_activity')}</h2>
          {recentJobs.length === 0 ? (
            <EmptyState message="No jobs yet. Start your first translation to create a project activity trail." ctaHref="/translate" ctaLabel="New Translation" />
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div key={job.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="font-medium">{job.name}</p>
                  <p className="text-xs text-slate-400">Last update synced • awaiting crew confirmation</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel p-6">
          <h2 className="mb-3 text-xl font-semibold">{t('dash_ops_tools')}</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-violet-400/30 bg-violet-500/10 p-3">Quick Action: Start Daily Brief</div>
            {[
              'Daily Brief Generator',
              'Toolbox Safety Briefs',
              'Incident + Work Order templates',
              'Bilingual PDF field reports'
            ].map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">{item}</div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
