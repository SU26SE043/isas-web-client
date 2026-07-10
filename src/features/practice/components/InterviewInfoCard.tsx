import React from 'react';
import { useLanguage } from '../../../shared/languages';

export const InterviewInfoCard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-surface-overlay rounded-lg shadow-sm border border-default p-5 flex flex-col">
      <h3 className="font-bold text-foreground mb-3">{t('practice.infoCardTitle')}</h3>
      
      <div className="bg-surface-raised rounded-xl p-4 flex flex-col gap-4  border border-default">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-base flex items-center justify-center text-muted-foreground flex-shrink-0 border border-subtle">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex items-center h-8">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium font-normal">{t('practice.position')}</span> 
              <span className="bg-surface-overlay/40 text-foreground px-2.5 py-1 rounded-md text-xs font-bold">{t('practice.badge')}</span>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-base flex items-center justify-center text-muted-foreground flex-shrink-0 border border-subtle">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="flex items-center h-8">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium font-normal">{t('practice.difficulty')}</span> 
              <span className="bg-surface-overlay text-muted-foreground px-2.5 py-1 rounded-md text-xs font-bold">{t('practice.intermediate')}</span>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-base flex items-center justify-center text-muted-foreground flex-shrink-0 border border-subtle">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex items-center justify-between w-full h-8">
            <p className="text-sm font-semibold text-foreground"><span className="text-xs text-muted-foreground font-medium font-normal mr-1">{t('practice.question')}</span> 3 / 10</p>
          </div>
        </div>
      </div>
    </div>
  );
};
