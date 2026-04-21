'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'es';

type Dict = Record<string, { en: string; es: string }>;

const dictionary: Dict = {
  nav_dashboard: { en: 'Dashboard', es: 'Panel' },
  nav_translate: { en: 'New Translation', es: 'Nueva traducción' },
  nav_logs: { en: 'Job Logs', es: 'Bitácoras' },
  nav_account: { en: 'Account', es: 'Cuenta' },
  nav_login: { en: 'Login', es: 'Entrar' },
  nav_signup: { en: 'Get Started', es: 'Empezar' },
  hero_title: { en: 'Language gaps cost construction teams time, money, and safety.', es: 'Las barreras de idioma cuestan tiempo, dinero y seguridad en la obra.' },
  hero_sub: { en: 'CrewBridge gives owners and crews fast, jobsite-ready English ↔ Spanish communication with safety-first translation logs.', es: 'CrewBridge conecta a dueños y cuadrillas con comunicación rápida en inglés ↔ español, lista para obra y enfocada en seguridad.' },
  cta_primary: { en: 'Start Translating', es: 'Comenzar a traducir' },
  cta_secondary: { en: 'Try Demo', es: 'Probar demo' },
  login_title: { en: 'Welcome back', es: 'Bienvenido de nuevo' },
  signup_title: { en: 'Create your CrewBridge account', es: 'Crea tu cuenta de CrewBridge' },
  dashboard_title: { en: 'Operations Dashboard', es: 'Panel de operaciones' },
  translate_title: { en: 'Two-way jobsite translation', es: 'Traducción bidireccional de obra' },
  logs_title: { en: 'Job communication logs', es: 'Bitácoras de comunicación' },
  account_title: { en: 'Account & usage', es: 'Cuenta y uso' },
  footer_tag: { en: 'Bridge the language gap on your job site.', es: 'Cierra la brecha de idioma en tu obra.' }
};

type Ctx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof typeof dictionary) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('cb-lang');
    if (saved === 'en' || saved === 'es') setLang(saved);
  }, []);

  function update(next: Lang) {
    setLang(next);
    localStorage.setItem('cb-lang', next);
  }

  const value = useMemo(
    () => ({
      lang,
      setLang: update,
      t: (key: keyof typeof dictionary) => dictionary[key][lang]
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
