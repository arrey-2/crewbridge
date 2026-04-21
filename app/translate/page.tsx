'use client';

import { useEffect, useMemo, useState } from 'react';
import { TRADES } from '@/lib/constants';
import { getDailyResetText } from '@/lib/utils';

const templates = {
  'Daily Briefing': 'Team, today we are starting on Level 2 framing. Verify all wall layouts before fastening tracks.',
  'Safety Warning': 'Warning: use fall protection when working near the stair opening and keep guardrails in place.',
  'Task Assignment': 'Juan and Luis, run conduit from panel A to classroom 104 and label all circuits before lunch.'
};

declare global { interface Window { webkitSpeechRecognition?: any; SpeechRecognition?: any; } }

export default function TranslatePage() {
 const [senderRole,setSenderRole]=useState<'Owner'|'Worker'>('Owner');
 const [trade,setTrade]=useState('General Labor');
 const [jobName,setJobName]=useState('');
 const [input,setInput]=useState('');
 const [output,setOutput]=useState('');
 const [loading,setLoading]=useState(false);
 const [warning,setWarning]=useState('');
 const [remaining,setRemaining]=useState(20);
 const sourceLang=senderRole==='Owner'?'English':'Spanish';
 const targetLang=senderRole==='Owner'?'Spanish':'English';
 const charsRemaining=useMemo(()=>500-input.length,[input]);
 useEffect(()=>{ if(document.cookie.includes('cb-demo=1')){ setRemaining(5); setTrade('Plumbing');}},[]);
 async function onTranslate(){ setLoading(true); setWarning(''); const response=await fetch('/api/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input,senderRole,trade,jobName})}); const data=await response.json(); if(!response.ok){ if(response.status===403) setWarning(data.error||getDailyResetText()); else if(response.status===440){ if(document.cookie.includes('cb-demo=1')) setWarning(data.error||'Demo session limit reached.'); else window.location.href='/login?message=Session+expired.+Please+log+in+again'; } else setWarning(data.error||'Translation unavailable. Please try again.'); setLoading(false); return;} setOutput(data.translated); setRemaining(data.usageRemaining ?? remaining); if(data.safetyFlag) setWarning('FLAG: This instruction may involve a safety hazard. Verify compliance before proceeding.'); setLoading(false);} 
 function useVoice(){ const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR) return; const recog=new SR(); recog.lang=senderRole==='Owner'?'en-US':'es-US'; recog.onresult=(event:any)=>{const transcript=event.results?.[0]?.[0]?.transcript; if(transcript) setInput(transcript.slice(0,500));}; recog.start();}
 return (<div className='space-y-5'><div className='rounded-lg border border-slate-700 bg-panel p-5'><h1 className='text-2xl font-semibold'>Two-way Translation</h1><p className='text-slate-300'>Translations remaining today: {remaining}</p>{document.cookie.includes('cb-demo=1')&&<p className='text-xs text-amber-300 mt-2'>Demo mode uses real translation with limited usage and no saved logs.</p>}</div><div className='grid gap-4 rounded-lg border border-slate-700 bg-panel p-5 lg:grid-cols-2'><div className='space-y-3'><label className='text-sm'>Sender</label><div className='flex gap-2'><button onClick={()=>setSenderRole('Owner')} className={`rounded-md px-3 py-2 ${senderRole==='Owner'?'bg-amber-500 text-black':'border border-slate-700'}`}>Owner</button><button onClick={()=>setSenderRole('Worker')} className={`rounded-md px-3 py-2 ${senderRole==='Worker'?'bg-amber-500 text-black':'border border-slate-700'}`}>Worker</button></div><label className='text-sm'>Trade Type</label><select className='w-full' value={trade} onChange={(e)=>setTrade(e.target.value)}>{TRADES.map(t=><option key={t}>{t}</option>)}</select><label className='text-sm'>Job Name</label><input value={jobName} onChange={(e)=>setJobName(e.target.value)} className='w-full' placeholder='Project name' maxLength={120}/><label className='text-sm'>{sourceLang} instruction</label><textarea value={input} onChange={(e)=>setInput(e.target.value.slice(0,500))} rows={6} className='w-full'/><p className='text-right text-xs text-slate-400'>{charsRemaining} characters remaining</p><div className='flex gap-2'><button onClick={useVoice} className='rounded-md border border-slate-600 px-3 py-2'>Voice Input</button><button onClick={onTranslate} className='rounded-md bg-amber-500 px-4 py-2 font-semibold text-black'>Translate</button></div><div className='flex flex-wrap gap-2 pt-2'>{Object.entries(templates).map(([name,value])=><button key={name} onClick={()=>setInput(value)} className='rounded-md border border-slate-700 px-2 py-1 text-xs'>{name}</button>)}</div>{loading&&<div><div className='mb-1 text-sm'>Translating</div><div className='h-2 overflow-hidden rounded-full bg-slate-800'><div className='h-full w-full animate-pulse bg-amber-500'/></div></div>}{warning&&<div className='rounded-md border border-amber-400 bg-amber-500/20 p-3 text-amber-200'>{warning}</div>}</div><div className='grid gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'><div className='rounded-md border border-slate-700 bg-slate-900 p-4'><h2 className='mb-2 font-semibold'>Original ({sourceLang})</h2><p className='whitespace-pre-wrap text-slate-200'>{input||'Enter instruction to translate.'}</p></div><div className='rounded-md border border-slate-700 bg-slate-900 p-4'><h2 className='mb-2 font-semibold'>Translated ({targetLang})</h2><p className='whitespace-pre-wrap text-slate-200'>{output||'Translation will appear here.'}</p></div></div></div></div>);
}
