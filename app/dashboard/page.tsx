'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { EmptyState } from '@/components/EmptyState';

export default function DashboardPage() {
  const [name, setName] = useState('CrewBridge User');
  const [stats, setStats] = useState({ daily: 0, remaining: 20 });
  const [recentJobs, setRecentJobs] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const isDemo = document.cookie.includes('cb-demo=1');
    if (isDemo) {
      setName('Demo Foreman');
      setRecentJobs([
        { id: '1', name: 'Riverfront Apartments - Plumbing Rough-In' },
        { id: '2', name: 'Westgate School - Electrical Panel Upgrade' }
      ]);
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
      <section className="rounded-lg border border-slate-700 bg-panel p-6">
        <h1 className="text-2xl font-semibold">Welcome, {name}</h1>
        <p className="mt-2 text-slate-300">Daily translations: {stats.daily} / 20</p>
        <p className="text-slate-300">Remaining today: {stats.remaining}</p>
        <div className="mt-4 flex gap-3">
          <Link href="/translate" className="rounded-md bg-amber-500 px-4 py-2 font-semibold text-black">Start Translation</Link>
          <Link href="/logs" className="rounded-md border border-slate-600 px-4 py-2">View Logs</Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Recent Jobs</h2>
        {recentJobs.length === 0 ? (
          <EmptyState message="No jobs yet. Start your first translation to create a job log." ctaHref="/translate" ctaLabel="New Translation" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {recentJobs.map((job) => (
              <div key={job.id} className="rounded-md border border-slate-700 bg-panel p-4">{job.name}</div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
