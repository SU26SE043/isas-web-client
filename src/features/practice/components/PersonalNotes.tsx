import React from 'react';
import { useLanguage } from '../../../shared/languages';

export const PersonalNotes: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-milk rounded-lg shadow-sm border border-yellow-400 p-5 flex flex-col flex-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-900">{t('practice.personalNotes')}</h3>
        <button className="bg-pine text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-pine/90 transition-colors cursor-pointer shadow-sm">
          {t('practice.save')}
        </button>
      </div>
      <textarea 
        placeholder={t('practice.notesPlaceholder') as string}
        className="flex-1 w-full bg-white border border-yellow-200/50 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine placeholder:text-slate-400 resize-none custom-scrollbar shadow-inner"
      ></textarea>
    </div>
  );
};
