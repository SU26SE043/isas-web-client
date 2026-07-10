import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '../shared/languages';

interface LanguageToggleProps {
  compact?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ compact = false }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className={cn(
        'relative flex items-center rounded-full border border-subtle bg-surface-overlay p-0.5',
        compact ? 'h-8 w-[4.25rem]' : 'h-9 w-[5.5rem]',
      )}
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
        className={`relative z-10 flex-1 text-center font-semibold transition-colors ${
          compact ? 'text-[10px]' : 'text-xs'
        } ${
          language === 'vi' ? 'text-black' : 'text-muted-foreground hover:text-foreground'
        }`}
        title={t('language.vietnamese')}
      >
        VI
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`relative z-10 flex-1 text-center font-semibold transition-colors ${
          compact ? 'text-[10px]' : 'text-xs'
        } ${
          language === 'en' ? 'text-black' : 'text-muted-foreground hover:text-foreground'
        }`}
        title={t('language.english')}
      >
        EN
      </button>
    </div>
  );
};
