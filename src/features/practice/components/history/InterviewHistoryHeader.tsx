import React from 'react';
import { useLanguage } from '../../../../shared/languages';

export const InterviewHistoryHeader: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex-shrink-0 relative h-28 md:h-32 bg-gradient-to-r from-surface-raised to-surface-overlay overflow-hidden border-b border-subtle">
      <div className="absolute inset-0 px-8 flex flex-col justify-center z-10 max-w-[1400px] mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
          {t('practice.history.title')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('practice.history.subtitle')}</p>
      </div>
    </div>
  );
};
