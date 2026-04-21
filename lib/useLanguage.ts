'use client';

import { useEffect, useState } from 'react';

export type Locale = 'en' | 'es';

const STORAGE_KEY = 'cb-lang';

function getStoredLanguage(): Locale {
  if (typeof window === 'undefined') return 'es';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'en' ? 'en' : 'es';
}

export function useLanguage(defaultLanguage: Locale = 'es') {
  const [language, setLanguageState] = useState<Locale>(defaultLanguage);

  useEffect(() => {
    const next = getStoredLanguage();
    setLanguageState(next);
    document.documentElement.lang = next;

    const onLanguageChange = () => {
      const updated = getStoredLanguage();
      setLanguageState(updated);
      document.documentElement.lang = updated;
    };

    window.addEventListener('storage', onLanguageChange);
    window.addEventListener('cb-language-change', onLanguageChange as EventListener);
    return () => {
      window.removeEventListener('storage', onLanguageChange);
      window.removeEventListener('cb-language-change', onLanguageChange as EventListener);
    };
  }, []);

  const setLanguage = (next: Locale) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
    setLanguageState(next);
    window.dispatchEvent(new Event('cb-language-change'));
  };

  return { language, setLanguage };
}
