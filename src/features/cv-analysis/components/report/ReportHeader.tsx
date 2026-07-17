import React from 'react';
import { BadgeCheck, FileText, CalendarClock } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { AnalysisFileMeta, CvAnalysisResult } from '../../types/cvAnalysis.types';

interface ReportHeaderProps {
  result: CvAnalysisResult;
  meta?: AnalysisFileMeta | null;
}

function formatDate(value: string, locale: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ result, meta }) => {
  const { language, t } = useLanguage();
  const hasJd = Boolean(result.jdId);

  return (
    <header className="frame-satin rounded-3xl bg-[var(--glass-bg)] p-6 backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="heading-primary text-2xl tracking-tight sm:text-3xl">
              {t('cv.report.headerTitle')}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-bg px-2.5 py-1 text-xs font-medium text-success">
              <BadgeCheck className="size-3.5" aria-hidden />
              {t('cv.report.statusReady')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{t('cv.report.headerSubtitle')}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-satin bg-white/[0.03] px-4 py-3">
          <dt className="text-caption text-muted-foreground">{t('cv.report.domain')}</dt>
          <dd className="mt-1 text-sm font-semibold text-foreground">{result.jobCategory || '—'}</dd>
        </div>
        <div className="rounded-2xl border border-satin bg-white/[0.03] px-4 py-3">
          <dt className="text-caption inline-flex items-center gap-1.5 text-muted-foreground">
            <CalendarClock className="size-3.5" aria-hidden />
            {t('cv.report.analysisTime')}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-foreground">
            {formatDate(result.createdAt, language)}
          </dd>
        </div>
        <div className="rounded-2xl border border-satin bg-white/[0.03] px-4 py-3">
          <dt className="text-caption inline-flex items-center gap-1.5 text-muted-foreground">
            <FileText className="size-3.5" aria-hidden />
            {t('cv.report.cvName')}
          </dt>
          <dd className="mt-1 truncate text-sm font-semibold text-foreground">
            {meta?.cvFileName || result.cvId}
          </dd>
        </div>
        <div className="rounded-2xl border border-satin bg-white/[0.03] px-4 py-3">
          <dt className="text-caption text-muted-foreground">{t('cv.report.jdStatus')}</dt>
          <dd className="mt-1 text-sm font-semibold text-foreground">
            {hasJd
              ? meta?.jdFileName || t('cv.report.jdUploaded')
              : t('cv.report.noJd')}
          </dd>
        </div>
      </dl>
    </header>
  );
};
