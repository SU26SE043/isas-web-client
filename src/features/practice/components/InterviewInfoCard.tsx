import React from 'react';
import { useLanguage } from '../../../shared/languages';

interface InterviewInfoCardProps {
  sessionTitle: string;
  currentIndex: number;
  totalQuestions: number;
}

export const InterviewInfoCard: React.FC<InterviewInfoCardProps> = ({
  sessionTitle,
  currentIndex,
  totalQuestions,
}) => {
  const { t } = useLanguage();
  const questionNumber = totalQuestions > 0 ? currentIndex + 1 : 0;

  return (
    <div className="flex flex-col rounded-lg border border-default bg-surface-overlay p-5 shadow-sm">
      <h3 className="mb-3 font-bold text-foreground">{t('practice.infoCardTitle')}</h3>

      <div className="flex flex-col gap-4 rounded-xl border border-default bg-surface-raised p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-subtle bg-surface-base text-muted-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex h-8 items-center">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="text-xs font-normal text-muted-foreground">{t('practice.position')}</span>
              <span className="rounded-md bg-surface-overlay/40 px-2.5 py-1 text-xs font-bold text-foreground">
                {sessionTitle || t('practice.badge')}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-subtle bg-surface-base text-muted-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex h-8 w-full items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              <span className="mr-1 text-xs font-normal text-muted-foreground">{t('practice.question')}</span>
              {questionNumber} / {totalQuestions}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
