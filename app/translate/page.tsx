'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { TRADES } from '@/lib/constants';
import { getDailyResetText } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageProvider';

const templates = {
  dailyEn: 'Team, today we are starting on Level 2 framing. Verify all wall layouts before fastening tracks.',
  dailyEs: 'Cuadrilla, hoy arrancamos con el entramado del Nivel 2. Verifiquen todos los trazos de muro antes de fijar los rieles.',
  safetyEn: 'Warning: use fall protection when working near the stair opening and keep guardrails in place.',
  safetyEs: 'Advertencia: usen protección contra caídas al trabajar cerca de la apertura de escaleras y mantengan los barandales colocados.',
  taskEn: 'Juan and Luis, run conduit from panel A to classroom 104 and label all circuits before lunch.',
  taskEs: 'Juan y Luis, instalen el conduit del panel A al salón 104 y etiqueten todos los circuitos antes de la comida.'
};

declare global { interface Window { webkitSpeechRecognition?: any; SpeechRecognition?: any; } }

export default function TranslatePage() {
  const { t } = useLanguage();
  const [senderRole, setSenderRole] = useState<'Owner' | 'Worker'>('Owner');
  const [trade, setTrade] = useState('General Labor');
  const [jobName, setJobName] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState('');
  const [remaining, setRemaining] = useState(20);
  const [confirmation, setConfirmation] = useState('');
  const [isDemo, setIsDemo] = useState(false);

  const sourceLang = senderRole === 'Owner' ? 'English' : 'Spanish';
  const targetLang = senderRole === 'Owner' ? 'Spanish' : 'English';
  const charsRemaining = useMemo(() => 500 - input.length, [input]);
  const workflowStatus = {
    instruction: input.trim().length > 0,
    translated: output.trim().length > 0,
    confirmed: confirmation.trim().length > 0
  };

  useEffect(() => {
    if (document.cookie.includes('cb-demo=1')) {
      setIsDemo(true);
      setRemaining(10);
      setTrade('Plumbing');
    }
  }, []);

  async function onTranslate() {
    if (!input.trim() || loading) return;

    setLoading(true);
    setWarning('');

    try {
      const response = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input, senderRole, trade, jobName }) });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) setWarning(data.error || getDailyResetText());
        else if (response.status === 440) window.location.href = '/login?message=Session+expired.+Please+log+in+again';
        else setWarning(data.error || t('translate_error_generic'));
        return;
      }

      setOutput(data.translated);
      setRemaining(data.usageRemaining ?? remaining);
      if (data.safetyFlag) setWarning(t('translate_warning'));
    } catch {
      setWarning(t('translate_error_generic'));
    } finally {
      setLoading(false);
    }
  }

  function useVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recog = new SR();
    recog.lang = senderRole === 'Owner' ? 'en-US' : 'es-US';
    recog.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) setInput(transcript.slice(0, 500));
    };
    recog.start();
  }

  return (
    <div className="space-y-5">
      <section className="panel p-5">
        <h1 className="text-2xl font-semibold">{t('translate_title')}</h1>
        <p className="text-slate-300">{t('translate_remaining')}: {remaining}</p>
        {isDemo && <p className="mt-2 inline-flex rounded-full border border-violet-300/30 bg-violet-400/10 px-3 py-1 text-xs text-violet-200">{t('translate_demo_badge')}</p>}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="panel space-y-4 p-5">
          <div className="inline-flex rounded-full border border-white/15 p-1">
            {(['Owner', 'Worker'] as const).map((role) => (
              <button key={role} onClick={() => setSenderRole(role)} className={`rounded-full px-4 py-1.5 text-sm ${senderRole === role ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'text-slate-300'}`}>
                {role === 'Owner' ? t('translate_role_owner') : t('translate_role_worker')}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <select value={trade} onChange={(e) => setTrade(e.target.value)}>{TRADES.map((x) => <option key={x}>{x}</option>)}</select>
            <input value={jobName} onChange={(e) => setJobName(e.target.value)} placeholder={t('translate_project_name')} maxLength={120} />
          </div>

          <textarea value={input} onChange={(e) => setInput(e.target.value.slice(0, 500))} rows={7} placeholder={t('translate_instruction_placeholder')} />
          <div className="flex items-center justify-between text-xs text-slate-400"><span>{sourceLang} {t('translate_input_label').toLowerCase()}</span><span>{charsRemaining} {t('translate_characters_remaining')}</span></div>

          <div className="flex flex-wrap gap-2">
            <button onClick={useVoice} className="btn-secondary">{t('translate_voice')}</button>
            <button onClick={onTranslate} disabled={loading || !input.trim()} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">{loading ? t('translate_loading') : t('translate_button')}</button>
            {[
              [t('translate_template_daily'), senderRole === 'Owner' ? templates.dailyEn : templates.dailyEs],
              [t('translate_template_safety'), senderRole === 'Owner' ? templates.safetyEn : templates.safetyEs],
              [t('translate_template_task'), senderRole === 'Owner' ? templates.taskEn : templates.taskEs]
            ].map(([label, value]) => <button key={label} onClick={() => setInput(value)} className="rounded-xl border border-white/20 px-3 py-2 text-xs hover:bg-white/5">{label}</button>)}
          </div>

          {loading && <div className="rounded-xl border border-violet-300/30 bg-violet-400/10 p-3 text-sm">{t('translate_loading')}<div className="mt-2 h-1.5 rounded-full bg-white/10"><div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-violet-500 to-orange-400" /></div></div>}
          {warning && <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 p-3 text-amber-200">{warning}</div>}

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <p className="mb-2 text-sm font-medium">{t('translate_confirmation_title')}</p>
            <div className="flex flex-wrap gap-2">
              {[t('translate_confirmation_ok'), t('translate_confirmation_clarify'), t('translate_confirmation_safety')].map((item) => (
                <button key={item} onClick={() => setConfirmation(item)} className={`rounded-xl px-3 py-1.5 text-xs ${confirmation === item ? 'bg-orange-500 text-white' : 'border border-white/20'}`}>{item}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-5">
            <h2 className="text-sm uppercase tracking-wider text-slate-400">{t('translate_original')} ({sourceLang})</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-200">{input || t('translate_empty_original')}</p>
          </div>
          <div className="panel p-5">
            <h2 className="text-sm uppercase tracking-wider text-slate-400">{t('translate_translated')} ({targetLang})</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-200">{output || t('translate_empty_result')}</p>
          </div>
          <div className="panel p-5 text-sm text-slate-300">
            <p className="font-medium text-white">{t('translate_workflow_helpers')}</p>
            <p className="mt-2">{t('translate_helper_text')}</p>
          </div>
          <div className="panel p-5">
            <p className="text-sm font-semibold text-white">{t('translate_workflow_title')}</p>
            <div className="mt-3 space-y-2 text-sm">
              {[
                { label: t('translate_workflow_step_1'), done: workflowStatus.instruction },
                { label: t('translate_workflow_step_2'), done: workflowStatus.translated },
                { label: t('translate_workflow_step_3'), done: workflowStatus.confirmed },
                { label: t('translate_workflow_step_4'), done: workflowStatus.translated && workflowStatus.confirmed }
              ].map(({ label, done }) => (
                <p key={label} className={`rounded-lg border px-3 py-2 ${done ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/[0.02] text-slate-300'}`}>
                  {done ? '✓' : '•'} {label}
                </p>
              ))}
            </div>
            <Link href="/logs" className={`mt-3 inline-flex rounded-xl px-4 py-2 text-sm font-semibold ${workflowStatus.translated && workflowStatus.confirmed ? 'bg-gradient-to-r from-violet-500 to-blue-500 text-white' : 'pointer-events-none border border-white/15 text-slate-500'}`}>
              {t('translate_generate_report')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
