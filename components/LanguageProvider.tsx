'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'es';

type Dict = Record<string, { en: string; es: string }>;

const dictionary: Dict = {
  nav_dashboard: { en: 'Dashboard', es: 'Panel' },
  nav_translate: { en: 'New Translation', es: 'Nueva traducción' },
  nav_logs: { en: 'Job Logs', es: 'Bitácoras' },
  nav_account: { en: 'Account', es: 'Cuenta' },
  nav_templates: { en: 'Templates', es: 'Plantillas' },
  nav_login: { en: 'Log In', es: 'Entrar' },
  nav_signup: { en: 'Get Started', es: 'Empezar' },

  hero_badge: { en: 'AI Operating System for Bilingual Construction Teams', es: 'Sistema operativo con IA para equipos bilingües de construcción' },
  hero_title_a: { en: 'Stop costly miscommunication.', es: 'Evita malentendidos que cuestan caro.' },
  hero_title_b: { en: 'Run every job in two languages.', es: 'Coordina cada obra en dos idiomas.' },
  hero_sub: {
    en: 'CrewBridge combines translation, safety communication, confirmations, templates, and reports so every crew member gets clear instructions the first time.',
    es: 'CrewBridge junta traducción, comunicación de seguridad, confirmaciones, plantillas y reportes para que toda la cuadrilla reciba instrucciones claras desde la primera vez.'
  },
  cta_primary: { en: 'Start Translating', es: 'Empezar a traducir' },
  cta_secondary: { en: 'Try Demo', es: 'Probar demo' },

  home_translate_title: { en: 'Translate', es: 'Traducir' },
  home_translate_desc: { en: 'Owner ↔ worker communication with trade-specific jobsite phrasing.', es: 'Comunicación dueño ↔ trabajador con lenguaje real de obra por oficio.' },
  home_coord_title: { en: 'Coordinate', es: 'Coordinar' },
  home_coord_desc: { en: 'Daily briefs, toolbox talks, and task confirmations in one workflow.', es: 'Brief diario, charla de seguridad y confirmaciones en un mismo flujo.' },
  home_doc_title: { en: 'Document', es: 'Documentar' },
  home_doc_desc: { en: 'Searchable logs and polished bilingual reports for clients and compliance.', es: 'Bitácoras buscables y reportes bilingües listos para cliente y cumplimiento.' },

  home_preview_label: { en: 'Operations Preview', es: 'Vista previa operativa' },
  home_preview_title: { en: 'Everything your foreman needs each morning', es: 'Todo lo que necesita el encargado cada mañana' },
  home_preview_1: { en: 'Daily Brief Generator', es: 'Generador de brief diario' },
  home_preview_2: { en: 'Toolbox Safety Briefs', es: 'Charlas de seguridad tipo toolbox' },
  home_preview_3: { en: 'Crew Confirmations & Clarifications', es: 'Confirmaciones y aclaraciones de cuadrilla' },
  home_preview_4: { en: 'Job Logs + Professional Reports', es: 'Bitácoras de obra + reportes profesionales' },
  home_live_label: { en: 'Live Ops Panel', es: 'Panel operativo en vivo' },
  home_live_owner: { en: 'Owner: Check trench depth before laying pipe.', es: 'Encargado: Revisen la profundidad de la zanja antes de tender la tubería.' },
  home_live_worker: { en: 'Crew: Got it, we’ll verify depth and slope before we set pipe.', es: 'Cuadrilla: Va, verificamos profundidad y pendiente antes de meter tubería.' },
  home_live_safety: { en: '⚠️ Safety flag: Verify controls before starting excavation work.', es: '⚠️ Alerta de seguridad: Verifiquen controles antes de empezar excavación.' },
  home_live_confirm: { en: 'Crew confirmation: Understood', es: 'Confirmación de cuadrilla: Entendido' },

  login_title: { en: 'Welcome back', es: 'Bienvenido de nuevo' },
  signup_title: { en: 'Create your CrewBridge account', es: 'Crea tu cuenta de CrewBridge' },
  dashboard_title: { en: 'Operations Dashboard', es: 'Panel de operaciones' },
  templates_title: { en: 'Template Operations', es: 'Plantillas operativas' },
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
