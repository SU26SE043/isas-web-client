import React from 'react';
import { useLanguage } from '../../../../shared/languages';

export const InterviewHistoryEmptyState: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 text-muted-foreground">
      <svg className="w-12 h-12 mb-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-sm font-semibold text-muted-foreground">{t('practice.history.emptyTitle')}</p>
      <p className="text-xs mt-1">{t('practice.history.emptyDesc')}</p>
    </div>
  );
};
