'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { EmptyState } from '@/components/EmptyState';
import { useLanguage } from '@/components/LanguageProvider';

type DashboardStats = {
  daily: number;
  remaining: number;
  activeJobs: number;
  reports: number;
  safetyAlerts: number;
  savedTranslations: number;
};

export default function DashboardPage() {
  const { t } = useLanguage();
  const [name, setName] = useState('CrewBridge User');
  const [stats, setStats] = useState<DashboardStats>({ daily: 0, remaining: 20, activeJobs: 0, reports: 0, safetyAlerts: 0, savedTranslations: 0 });
  const [recentJobs, setRecentJobs] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const isDemo = document.cookie.includes('cb-demo=1');
    if (isDemo) {
      setName('Demo Foreman');
      setRecentJobs([
        { id: '1', name: 'Riverfront Apartments - Plumbing Rough-In' },
        { id: '2', name: 'Westgate School - Electrical Panel Upgrade' },
        { id: '3', name: 'Sunset Retail Buildout - HVAC Duct Install' }
      ]);
      setStats({ daily: 6, remaining: 14, activeJobs: 3, reports: 12, safetyAlerts: 2, savedTranslations: 48 });
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

      const { data: translations } = await supabaseClient.from('translations').select('id,safety_flag', { count: 'exact' }).eq('user_id', user.id);
      const savedTranslations = translations?.length ?? 0;
      const safetyAlerts = translations?.filter((entry) => entry.safety_flag).length ?? 0;

      setStats({
        daily,
        remaining: Math.max(0, 20 - daily),
        activeJobs: jobs?.length ?? 0,
        reports: Math.ceil(savedTranslations / 5),
        safetyAlerts,
        savedTranslations
      });
    })();
  }, []);

  const metricCards = [
    [t('dash_active_jobs'), `${stats.activeJobs}`],
    ['Reports generated', `${stats.reports}`],
    [t('dash_alerts'), `${stats.safetyAlerts}`],
    ['Translations saved', `${stats.savedTranslations}`],
    [t('dash_translations_today'), `${stats.daily}`],
    [t('dash_remaining'), `${stats.remaining}`]
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="panel p-6 md:p-7">
        <p className="text-sm text-slate-400">{t('dashboard_good_morning')}</p>
        <h1 className="text-3xl font-semibold">{t('dashboard_title')} • {name}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">CrewBridge unifies bilingual communication, safety tracking, and field documentation so your teams execute faster with fewer misses.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {metricCards.map(([label, value], idx) => (
            <div key={label} className={`rounded-xl border p-4 ${idx < 2 ? 'border-violet-400/40 bg-violet-500/10' : 'border-white/10 bg-white/[0.02]'}`}>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-1 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/translate" className="btn-primary">New Field Translation</Link>
          <Link href="/logs" className="btn-secondary">Export Crew Reports</Link>
          <Link href="/templates" className="btn-secondary">{t('dash_open_templates')}</Link>
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
                  <p className="text-xs text-slate-400">Crew activity synced • next recommended action: issue daily brief update</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel p-6">
          <h2 className="mb-3 text-xl font-semibold">Quick actions</h2>
          <div className="space-y-3 text-sm">
            {[
              ['Daily Briefs', 'Generate bilingual task plans for the day'],
              ['Safety Talks', 'Create toolbox talks with hazard controls'],
              ['Crew Logs', 'Capture confirmations and clarification responses'],
              ['Reports', 'Build premium bilingual PDFs for owners and compliance'],
              ['Templates', 'Standardize recurring instructions by trade']
            ].map(([title, detail]) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-slate-400">{detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
