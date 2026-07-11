import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { CvAnalysisResult } from '../../types/cvAnalysis.types';

interface CvMatchReportHeaderProps {
  result: CvAnalysisResult;
}

export const CvMatchReportHeader: React.FC<CvMatchReportHeaderProps> = ({ result }) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-subtle bg-surface-raised p-5 sm:p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div
            className="relative flex size-24 shrink-0 items-center justify-center rounded-full border-4 border-subtle bg-surface-base"
            aria-label={`${t('result.match')}: ${result.matchScore}%`}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{result.matchScore}</p>
              <p className="text-caption text-muted-foreground">/100</p>
            </div>
          </div>
          <div>
            <h1 className="heading-primary text-2xl sm:text-3xl">{result.fullName}</h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{result.jobTitle}</p>
            <span className="mt-3 inline-flex rounded-full border border-subtle bg-surface-overlay px-3 py-1 text-xs font-semibold text-foreground">
              {t('result.goodFit')}
            </span>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:min-w-[12rem]">
          <div>
            <dt className="text-label text-muted-foreground">{t('result.match')}</dt>
            <dd className="mt-1 font-semibold text-foreground">{result.matchScore}%</dd>
          </div>
          <div>
            <dt className="text-label text-muted-foreground">{t('cv.profileCompletion')}</dt>
            <dd className="mt-1 font-semibold text-foreground">{result.profileCompletionPercent}%</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
