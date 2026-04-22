'use client';

import { useEffect, useMemo, useState } from 'react';
import { TRADES } from '@/lib/constants';
import { getDailyResetText } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageProvider';

const templates = {
  'Daily Briefing': 'Team, today we are starting on Level 2 framing. Verify all wall layouts before fastening tracks.',
  'Safety Warning': 'Warning: use fall protection when working near the stair opening and keep guardrails in place.',
  'Task Assignment': 'Juan and Luis, run conduit from panel A to classroom 104 and label all circuits before lunch.'
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

  useEffect(() => {
    if (document.cookie.includes('cb-demo=1')) {
      setIsDemo(true);
      setRemaining(10);
      setTrade('Plumbing');
    }
  }, []);

  async function onTranslate() {
    setLoading(true);
    setWarning('');
    const response = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input, senderRole, trade, jobName }) });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 403) setWarning(data.error || getDailyResetText());
      else if (response.status === 440) window.location.href = '/login?message=Session+expired.+Please+log+in+again';
      else setWarning(data.error || 'Translation unavailable. Please try again.');
      setLoading(false);
      return;
    }

    setOutput(data.translated);
    setRemaining(data.usageRemaining ?? remaining);
    if (data.safetyFlag) setWarning(t('translate_warning'));
    setLoading(false);
  }

  function useVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recog = new SR();
    recog.lang = senderRole === 'Owner' ? 'en-US' : 'es-US';
    recog.onresult = (event: any) => { const transcript = event.results?.[0]?.[0]?.transcript; if (transcript) setInput(transcript.slice(0, 500)); };
    recog.start();
  }

  return (
    <div className="space-y-5">
      <section className="panel p-5">
        <h1 className="text-2xl font-semibold">{t('translate_title')}</h1>
        <p className="text-slate-300">{t('translate_remaining')}: {remaining}</p>
        {isDemo && <p className="mt-2 inline-flex rounded-full border border-violet-300/30 bg-violet-400/10 px-3 py-1 text-xs text-violet-200">Demo Mode – Real Translation (Limited Access)</p>}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="panel space-y-4 p-5">
          <div className="inline-flex rounded-full border border-white/15 p-1">
            {(['Owner', 'Worker'] as const).map((role) => (
              <button key={role} onClick={() => setSenderRole(role)} className={`rounded-full px-4 py-1.5 text-sm ${senderRole === role ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'text-slate-300'}`}>{role}</button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <select value={trade} onChange={(e) => setTrade(e.target.value)}>{TRADES.map((x) => <option key={x}>{x}</option>)}</select>
            <input value={jobName} onChange={(e) => setJobName(e.target.value)} placeholder="Project name" maxLength={120} />
          </div>

          <textarea value={input} onChange={(e) => setInput(e.target.value.slice(0, 500))} rows={7} placeholder={`${sourceLang} instruction`} />
          <div className="flex items-center justify-between text-xs text-slate-400"><span>{sourceLang} input</span><span>{charsRemaining} characters remaining</span></div>

          <div className="flex flex-wrap gap-2">
            <button onClick={useVoice} className="btn-secondary">{t('translate_voice')}</button>
            <button onClick={onTranslate} className="btn-primary">{t('translate_button')}</button>
            {Object.entries(templates).map(([n, v]) => <button key={n} onClick={() => setInput(v)} className="rounded-xl border border-white/20 px-3 py-2 text-xs hover:bg-white/5">{n}</button>)}
          </div>

          {loading && <div className="rounded-xl border border-violet-300/30 bg-violet-400/10 p-3 text-sm">Translating…<div className="mt-2 h-1.5 rounded-full bg-white/10"><div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-violet-500 to-orange-400" /></div></div>}
          {warning && <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 p-3 text-amber-200">{warning}</div>}

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <p className="mb-2 text-sm font-medium">Crew confirmation</p>
            <div className="flex flex-wrap gap-2">
              {['Understood', 'Need clarification', 'Safety issue'].map((item) => (
                <button key={item} onClick={() => setConfirmation(item)} className={`rounded-xl px-3 py-1.5 text-xs ${confirmation === item ? 'bg-orange-500 text-white' : 'border border-white/20'}`}>{item}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-5">
            <h2 className="text-sm uppercase tracking-wider text-slate-400">{t('translate_original')} ({sourceLang})</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-200">{input || 'Enter instruction to translate.'}</p>
          </div>
          <div className="panel p-5">
            <h2 className="text-sm uppercase tracking-wider text-slate-400">{t('translate_translated')} ({targetLang})</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-200">{output || 'Translation will appear here.'}</p>
          </div>
          <div className="panel p-5 text-sm text-slate-300">
            <p className="font-medium text-white">{t('translate_workflow_helpers')}</p>
            <p className="mt-2">{t('translate_helper_text')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
