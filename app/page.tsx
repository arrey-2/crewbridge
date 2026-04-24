'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

export default function LandingPage() {
  const { t, lang } = useLanguage();
  const productModules = [
    { title: t('home_module_daily_title'), desc: t('home_module_daily_desc') },
    { title: t('home_module_safety_title'), desc: t('home_module_safety_desc') },
    { title: t('home_module_logs_title'), desc: t('home_module_logs_desc') },
    { title: t('home_module_reports_title'), desc: t('home_module_reports_desc') },
    { title: t('home_module_templates_title'), desc: t('home_module_templates_desc') }
  ];
  const credibilityCards = [
    { title: t('home_stat_1_title'), body: t('home_stat_1_desc') },
    { title: t('home_stat_2_title'), body: t('home_stat_2_desc') },
    { title: t('home_stat_3_title'), body: t('home_stat_3_desc') },
    { title: t('home_stat_4_title'), body: t('home_stat_4_desc') }
  ];
  const painCards =
    lang === 'en'
      ? [
          ['Delays', 'Language confusion stalls crews and throws off schedules.'],
          ['Rework', 'Misunderstood instructions create expensive do-overs.'],
          ['Safety Risk', 'Critical warnings can be missed in the field.'],
          ['Documentation Gaps', 'Verbal-only communication leaves no paper trail.']
        ]
      : [
          ['Atrasos', 'La confusión por idioma detiene a la cuadrilla y afecta el calendario de obra.'],
          ['Retrabajo', 'Instrucciones mal entendidas generan correcciones costosas.'],
          ['Riesgo de seguridad', 'Avisos críticos pueden perderse en campo.'],
          ['Falta de evidencia', 'La comunicación solo verbal deja huecos en la documentación.']
        ];

  return (
    <div key={lang} className="animate-fade-in space-y-10 md:space-y-14">
      <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black px-6 pb-12 pt-14 md:px-12 md:pt-20">
        <div className="pointer-events-none absolute -left-16 top-8 h-60 w-60 rounded-full border-[10px] border-fuchsia-400/60" />
        <div className="pointer-events-none absolute right-8 top-16 h-44 w-44 rounded-full border-[9px] border-blue-400/60" />
        <div className="pointer-events-none absolute -bottom-8 left-1/4 h-72 w-72 rounded-full border-[11px] border-orange-300/45" />
        <div className="pointer-events-none absolute right-[-4rem] top-24 hidden w-[28rem] rotate-[-7deg] rounded-2xl border border-white/15 bg-white/5 p-4 opacity-55 blur-[1.6px] lg:block">
          <div className="space-y-2 rounded-xl bg-black/60 p-4">
            <p className="text-xs text-slate-300">{t('home_live_label')}</p>
            <div className="h-3 w-2/3 rounded bg-white/20" />
            <div className="h-3 w-1/2 rounded bg-white/20" />
            <div className="h-20 rounded bg-violet-500/20" />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <p className="mb-5 inline-flex rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-slate-300">{t('hero_badge')}</p>
          <h1 className="text-4xl font-semibold leading-[1.05] md:text-6xl">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-300 bg-clip-text text-transparent">CrewBridge</span>
            <br />
            <span className="text-balance">{lang === 'en' ? 'The bilingual operations platform for construction teams.' : 'La plataforma operativa bilingüe para equipos de construcción.'}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300">{t('hero_sub')}</p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">{t('home_supporting_copy')}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="btn-primary">{t('cta_primary')}</Link>
            <Link href="/login" className="btn-secondary">{t('cta_secondary')}</Link>
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t('home_stats_title')}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {credibilityCards.map((item) => (
          <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-lg font-semibold text-violet-300">{item.title}</p>
            <p className="mt-2 text-sm text-slate-300">{item.body}</p>
          </article>
        ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {painCards.map(([title, body]) => (
          <article key={title} className="panel p-5">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-slate-300">{body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          [t('home_translate_title'), t('home_translate_desc')],
          [t('home_coord_title'), t('home_coord_desc')],
          [t('home_doc_title'), t('home_doc_desc')]
        ].map(([title, body]) => (
          <article key={title} className="glass p-6">
            <h3 className="text-2xl font-semibold">{title}</h3>
            <p className="mt-2 text-slate-300">{body}</p>
          </article>
        ))}
      </section>

      <section className="panel p-6 md:p-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t('home_platform_label')}</p>
            <h2 className="mt-1 text-3xl font-semibold">{t('home_platform_title')}</h2>
          </div>
          <p className="max-w-xl text-sm text-slate-300">{t('home_platform_desc')}</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {productModules.map((module) => (
            <article key={module.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-lg font-semibold">{module.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{module.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-7 md:p-9">
            <p className="text-sm uppercase tracking-wider text-slate-400">{t('home_preview_label')}</p>
            <h2 className="mt-2 text-3xl font-semibold">{t('home_preview_title')}</h2>
            <div className="mt-5 grid gap-2 text-slate-300">
              <p>• {t('home_preview_1')}</p>
              <p>• {t('home_preview_2')}</p>
              <p>• {t('home_preview_3')}</p>
              <p>• {t('home_preview_4')}</p>
              <p>• {t('home_roi_snapshot')}</p>
            </div>
          </div>
          <div className="border-l border-white/10 bg-gradient-to-b from-indigo-500/10 to-orange-500/10 p-7">
            <div className="glass space-y-3 p-4">
              <div className="rounded-lg bg-white/5 p-3 text-sm">{t('home_live_owner')}</div>
              <div className="rounded-lg bg-violet-500/20 p-3 text-sm">{t('home_live_worker')}</div>
              <div className="rounded-lg border border-amber-300/30 bg-amber-400/10 p-3 text-sm text-amber-200">{t('home_live_safety')}</div>
              <div className="rounded-lg bg-white/5 p-3 text-xs text-slate-300">{t('home_live_confirm')}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
