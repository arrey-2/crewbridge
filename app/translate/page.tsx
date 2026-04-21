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

  const sourceLang = senderRole === 'Owner' ? 'English' : 'Spanish';
  const targetLang = senderRole === 'Owner' ? 'Spanish' : 'English';
  const charsRemaining = useMemo(() => 500 - input.length, [input]);

  useEffect(() => { if (document.cookie.includes('cb-demo=1')) { setRemaining(17); setTrade('Plumbing'); } }, []);

  async function onTranslate() {
    setLoading(true);
    setWarning('');
    if (document.cookie.includes('cb-demo=1')) {
      setTimeout(() => {
        setOutput(senderRole === 'Owner' ? 'Por favor revisen la zanja antes de instalar la tubería.' : 'Please check the trench before installing the pipe.');
        if (/fall|electrical|hazard|warning|danger|trench/i.test(input)) setWarning('FLAG: This instruction may involve a safety hazard. Verify compliance before proceeding.');
        setLoading(false);
      }, 700);
      return;
    }

    const response = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input, senderRole, trade, jobName }) });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 403) setWarning(getDailyResetText());
      else if (response.status === 440) window.location.href = '/login?message=Session+expired.+Please+log+in+again';
      else setWarning('Translation unavailable. Please try again.');
      setLoading(false);
      return;
    }

    setOutput(data.translated);
    setRemaining(data.usageRemaining ?? remaining);
    if (data.safetyFlag) setWarning('FLAG: This instruction may involve a safety hazard. Verify compliance before proceeding.');
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
      <div className="glass p-5"><h1 className="text-2xl font-semibold">{t('translate_title')}</h1><p className="text-slate-300">Translations remaining today: {remaining}</p></div>
      <div className="glass grid gap-6 p-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex gap-2">
            <button onClick={() => setSenderRole('Owner')} className={`rounded-xl px-3 py-2 ${senderRole === 'Owner' ? 'bg-violet-500' : 'border border-white/20'}`}>Owner</button>
            <button onClick={() => setSenderRole('Worker')} className={`rounded-xl px-3 py-2 ${senderRole === 'Worker' ? 'bg-violet-500' : 'border border-white/20'}`}>Worker</button>
          </div>
          <select className="w-full" value={trade} onChange={(e) => setTrade(e.target.value)}>{TRADES.map((x) => <option key={x}>{x}</option>)}</select>
          <input value={jobName} onChange={(e) => setJobName(e.target.value)} className="w-full" placeholder="Project name" maxLength={120} />
          <textarea value={input} onChange={(e) => setInput(e.target.value.slice(0, 500))} rows={6} className="w-full" placeholder={`${sourceLang} instruction`} />
          <p className="text-right text-xs text-slate-400">{charsRemaining} characters remaining</p>
          <div className="flex gap-2">
            <button onClick={useVoice} className="rounded-xl border border-white/20 px-3 py-2">Voice Input</button>
            <button onClick={onTranslate} className="rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-2 font-semibold">Translate</button>
          </div>
          <div className="flex flex-wrap gap-2">{Object.entries(templates).map(([n, v]) => <button key={n} onClick={() => setInput(v)} className="rounded-xl border border-white/20 px-3 py-1 text-xs">{n}</button>)}</div>
          {loading && <div><p className="mb-1 text-sm">Translating</p><div className="h-2 rounded-full bg-slate-800"><div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-violet-500 to-blue-500" /></div></div>}
          {warning && <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 p-3 text-amber-200">{warning}</div>}
        </div>
        <div className="grid gap-3">
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4"><h2 className="font-semibold">Original ({sourceLang})</h2><p className="mt-2 whitespace-pre-wrap text-slate-200">{input || 'Enter instruction to translate.'}</p></div>
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4"><h2 className="font-semibold">Translated ({targetLang})</h2><p className="mt-2 whitespace-pre-wrap text-slate-200">{output || 'Translation will appear here.'}</p></div>
        </div>
      </div>
    </div>
  );
}
