import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { CvAnalysisResult } from '../../types/cvAnalysis.types';
import { scoreToneClass } from '../../utils/cvChartColors';
import { CvMatchScoreRing } from './CvMatchScoreRing';

interface CvMatchReportHeaderProps {
  result: CvAnalysisResult;
}

export const CvMatchReportHeader: React.FC<CvMatchReportHeaderProps> = ({ result }) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-subtle bg-surface-raised p-5 sm:p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <CvMatchScoreRing score={result.matchScore} />
          <div>
            <h1 className="heading-primary text-2xl sm:text-3xl">{result.fullName}</h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{result.jobTitle}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full border border-subtle bg-surface-overlay px-3 py-1 text-xs font-semibold text-foreground">
                {t('result.goodFit')}
              </span>
              {result.domain ? (
                <span className="inline-flex rounded-full border border-info/30 bg-info-bg px-3 py-1 text-xs font-semibold text-info">
                  {t(`cv.domain.${result.domain}.title`)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:min-w-[12rem]">
          <div>
            <dt className="text-label text-muted-foreground">{t('result.match')}</dt>
            <dd className={cnScore(result.matchScore)}>{result.matchScore}%</dd>
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

function cnScore(score: number): string {
  return `mt-1 font-semibold ${scoreToneClass(score)}`;
}
