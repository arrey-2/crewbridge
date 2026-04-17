'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TRADES } from '@/lib/constants';
import { supabaseClient } from '@/lib/supabase';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [trade, setTrade] = useState(TRADES[0]);
  const [role, setRole] = useState<'Owner' | 'Worker'>('Owner');
  const [jobName, setJobName] = useState('');

  async function complete() {
    const { data } = await supabaseClient.auth.getUser();
    const user = data.user;
    if (!user) return;

    await supabaseClient.from('profiles').upsert({
      id: user.id,
      email: user.email,
      trade,
      role,
      onboarding_complete: true
    });

    await supabaseClient.from('jobs').insert({ user_id: user.id, name: jobName || 'First Job' });
    router.push('/dashboard');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 rounded-xl border border-slate-700 bg-panel p-6">
      <div className="h-2 rounded-full bg-slate-800">
        <div className="h-2 rounded-full bg-amber-500" style={{ width: `${(step / 3) * 100}%` }} />
      </div>
      {step === 1 && (
        <div>
          <h1 className="text-2xl font-semibold">Welcome to CrewBridge</h1>
          <p className="mt-2 text-slate-300">Bridge the language gap on your job site with trade-aware translations.</p>
        </div>
      )}
      {step === 2 && (
        <div>
          <h1 className="text-2xl font-semibold">Select your primary trade</h1>
          <select className="mt-3 w-full" value={trade} onChange={(e) => setTrade(e.target.value as any)}>
            {TRADES.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold">Your role and first job</h1>
          <select className="w-full" value={role} onChange={(e) => setRole(e.target.value as 'Owner' | 'Worker')}>
            <option>Owner</option>
            <option>Worker</option>
          </select>
          <input className="w-full" placeholder="Name your first job" value={jobName} onChange={(e) => setJobName(e.target.value)} />
        </div>
      )}
      <div className="flex justify-between">
        <button disabled={step === 1} onClick={() => setStep((s) => s - 1)} className="rounded-md border border-slate-600 px-4 py-2 disabled:opacity-40">Back</button>
        {step < 3 ? (
          <button onClick={() => setStep((s) => s + 1)} className="rounded-md bg-amber-500 px-4 py-2 font-semibold text-black">Next</button>
        ) : (
          <button onClick={complete} className="rounded-md bg-amber-500 px-4 py-2 font-semibold text-black">Finish</button>
        )}
      </div>
    </div>
  );
}
