'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black px-6 pb-10 pt-12 md:px-12 md:pt-16">
        <div className="pointer-events-none absolute -left-12 top-12 h-56 w-56 rounded-full border-[10px] border-fuchsia-400/60 blur-[1px]" />
        <div className="pointer-events-none absolute right-4 top-20 h-40 w-40 rounded-full border-[9px] border-blue-400/60" />
        <div className="pointer-events-none absolute bottom-6 left-1/4 h-64 w-64 rounded-full border-[12px] border-orange-300/50" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-slate-300">Translate. Coordinate. Document.</p>
          <h1 className="text-5xl font-semibold leading-tight md:text-7xl">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-300 bg-clip-text text-transparent">AI operations</span> for bilingual construction crews
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-300">{t('hero_sub')} Language barriers create delays, mistakes, rework, and safety risk. CrewBridge fixes all four in one workflow.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/signup" className="btn-primary">{t('cta_primary')}</Link>
            <Link href="/login" className="btn-secondary">{t('cta_secondary')}</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Bilingual Command Center', 'Send job instructions clearly between owner and worker in seconds.'],
          ['Safety-First Communication', 'Automatic risk flagging before tasks are executed in the field.'],
          ['Audit-Ready Documentation', 'Every message is logged, searchable, and exportable as a report.']
        ].map(([title, body]) => (
          <article key={title} className="glass p-6">
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-slate-300">{body}</p>
          </article>
        ))}
      </section>

      <section className="panel overflow-hidden">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <p className="text-sm uppercase tracking-wider text-slate-400">Product Preview</p>
            <h2 className="mt-2 text-3xl font-semibold">Built for real jobsite mornings</h2>
            <ul className="mt-4 space-y-2 text-slate-300">
              <li>• Daily brief generation</li>
              <li>• Toolbox talk drafting</li>
              <li>• Task confirmations from workers</li>
              <li>• Professional bilingual field reports</li>
            </ul>
          </div>
          <div className="border-l border-white/10 bg-gradient-to-b from-indigo-500/10 to-orange-500/10 p-6">
            <div className="glass p-4">
              <p className="text-xs text-slate-400">Live preview</p>
              <p className="mt-2">Check trench depth before laying pipe.</p>
              <p className="mt-2 text-violet-300">Revisen la profundidad de la zanja antes de tender la tubería.</p>
              <p className="mt-3 rounded-lg bg-amber-400/10 p-2 text-sm text-amber-200">⚠️ Safety flag triggered. Verify compliance before proceeding.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
