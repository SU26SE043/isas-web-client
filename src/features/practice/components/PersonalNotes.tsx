import React from 'react';
import { useLanguage } from '../../../shared/languages';

export const PersonalNotes: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-surface-overlay rounded-lg shadow-sm border border-default p-5 flex flex-col flex-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-foreground">{t('practice.personalNotes')}</h3>
        <button className="bg-surface-raised text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-surface-overlay transition-colors cursor-pointer shadow-sm">
          {t('practice.save')}
        </button>
      </div>
      <textarea 
        placeholder={t('practice.notesPlaceholder') as string}
        className="flex-1 w-full bg-surface-raised border border-default rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-default placeholder:text-muted-foreground resize-none custom-scrollbar "
      ></textarea>
    </div>
  );
};
