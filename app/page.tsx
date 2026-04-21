'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-8 py-8 lg:grid-cols-2">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-widest text-violet-200">Translate. Coordinate. Document.</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">{t('hero_title')}</h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">{t('hero_sub')}</p>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-300"><li>• Reduce delays</li><li>• Prevent costly rework</li><li>• Improve safety clarity</li><li>• Keep audit-ready records</li></ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-3 font-semibold">{t('cta_primary')}</Link>
            <Link href="/login" className="rounded-full border border-white/20 px-6 py-3 font-semibold">{t('cta_secondary')}</Link>
          </div>
        </div>
        <div className="glass p-6">
          <div className="grid gap-4">
            <div className="rounded-xl bg-slate-900/80 p-4">
              <p className="text-xs text-slate-400">Owner → Crew</p>
              <p className="mt-1">Check trench depth before laying pipe.</p>
              <p className="mt-2 text-violet-200">Revisen la profundidad de la zanja antes de tender la tubería.</p>
            </div>
            <div className="rounded-xl bg-slate-900/80 p-4">
              <p className="text-xs text-slate-400">Safety flag</p>
              <p className="mt-1 text-amber-300">⚠️ This instruction may involve a safety hazard. Verify compliance before proceeding.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['AI Jobsite Translation', 'Trade-aware English ↔ Spanish phrasing built for real crews.'],
          ['Safety-first Workflow', 'Automatic risk keyword flagging before work starts.'],
          ['Audit-ready Logs & PDFs', 'Every instruction is saved, searchable, and exportable.']
        ].map(([title, body]) => (
          <article key={title} className="glass p-6">
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-slate-300">{body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
