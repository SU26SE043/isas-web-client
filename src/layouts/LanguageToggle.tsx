import React from 'react';
import { useLanguage } from '../shared/languages';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className="relative flex h-9 w-[5.5rem] items-center rounded-full border border-subtle bg-surface-overlay p-0.5"
      aria-label={t('language.label')}
    >
      <div
        className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
          language === 'vi' ? 'translate-x-0.5' : 'translate-x-[calc(100%+2px)]'
        }`}
      />

      <button
        type="button"
        onClick={() => setLanguage('vi')}
        className={`relative z-10 flex-1 text-center text-xs font-semibold transition-colors ${
          language === 'vi' ? 'text-black' : 'text-muted-foreground hover:text-foreground'
        }`}
        title={t('language.vietnamese')}
      >
        VI
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`relative z-10 flex-1 text-center text-xs font-semibold transition-colors ${
          language === 'en' ? 'text-black' : 'text-muted-foreground hover:text-foreground'
        }`}
        title={t('language.english')}
      >
        EN
      </button>
    </div>
  );
};
