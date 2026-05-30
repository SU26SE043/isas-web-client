import React from 'react';
import { useLanguage } from '../shared/languages';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white/80 p-1 shadow-sm"
      aria-label={t('language.label')}
    >
      <button
        type="button"
        onClick={() => setLanguage('vi')}
        className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${language === 'vi' ? 'bg-brand-green text-white shadow-sm' : 'text-slate-500 hover:text-brand-green'}`}
        title={t('language.vietnamese')}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${language === 'en' ? 'bg-brand-yellow text-brand-green shadow-sm' : 'text-slate-500 hover:text-brand-green'}`}
        title={t('language.english')}
      >
        EN
      </button>
    </div>
  );
};
