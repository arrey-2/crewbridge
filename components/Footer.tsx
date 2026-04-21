'use client';

import { useLanguage } from './LanguageProvider';

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="mt-16 border-t border-white/10 py-6 text-center text-sm text-slate-400">
      <p>CrewBridge • {t('footer_tag')}</p>
    </footer>
  );
}
