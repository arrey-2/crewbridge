'use client';
import { useLanguage } from '@/lib/useLanguage';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 text-sm backdrop-blur">
      <button onClick={() => setLanguage('es')} className={`rounded-lg px-3 py-1 ${language==='es' ? 'bg-white text-slate-900' : 'text-slate-300'}`}>ES</button>
      <button onClick={() => setLanguage('en')} className={`rounded-lg px-3 py-1 ${language==='en' ? 'bg-white text-slate-900' : 'text-slate-300'}`}>EN</button>
    </div>
  );
}
