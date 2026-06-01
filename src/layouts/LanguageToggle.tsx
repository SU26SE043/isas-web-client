import React from 'react';
import { useLanguage } from '../shared/languages';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className="relative flex items-center rounded-full  p-1 w-24 h-10 bg-white"
      aria-label={t('language.label')}
    >
      {/* Sliding Background */}
      <div
        className={`absolute top-1 bottom-1 w-[42px] bg-black rounded-full transition-transform duration-300 ease-out shadow-sm ${language === 'vi' ? 'translate-x-0' : 'translate-x-[42px]'}`}
      ></div>

      <button
        type="button"
        onClick={() => setLanguage('vi')}
        className={`relative flex-1 text-center text-sm font-extrabold z-10 transition-colors duration-300 ${language === 'vi' ? 'text-white' : 'text-black hover:text-black/80'}`}
        title={t('language.vietnamese')}
      >
        VI
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`relative flex-1 text-center text-sm font-extrabold z-10 transition-colors duration-300 ${language === 'en' ? 'text-white' : 'text-black hover:text-black/80'}`}
        title={t('language.english')}
      >
        EN
      </button>
    </div>
  );
};
