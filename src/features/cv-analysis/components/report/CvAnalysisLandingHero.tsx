import { ArrowRight, BriefcaseBusiness, CalendarClock, FileText, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { formatJobCategoryDisplay } from '@/shared/domain/jobDomains';
import type { AnalysisFileMeta, CvAnalysisResult } from '../../types/cvAnalysis.types';
import { CvReportSourceActions } from './CvReportSourceActions';

interface CvAnalysisLandingHeroProps {
  result: CvAnalysisResult;
  meta?: AnalysisFileMeta | null;
  onOpenCv: () => void;
  onOpenJd: () => void;
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

export function CvAnalysisLandingHero({ result, meta, onOpenCv, onOpenJd }: CvAnalysisLandingHeroProps) {
  const { language, t } = useLanguage();

  return (
    <section className="relative overflow-hidden rounded-2xl frame-satin bg-surface-raised">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-info-bg),transparent_62%)] opacity-60"
      />
      <div className="relative p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-info/15 text-info-light ring-1 ring-info/20">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-info-light">
                {t('cv.landing.kicker')}
              </p>
              <h1 className="mt-1 heading-secondary text-2xl tracking-tight text-foreground sm:text-3xl">
                {t('cv.report.summary')}
              </h1>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
            <span className="size-1.5 rounded-full bg-success" aria-hidden />
            {t('cv.report.statusReady')}
          </span>
        </div>

        <p className="mt-5 rounded-xl border border-info/20 bg-info/5 px-4 py-3 text-sm leading-6 text-foreground/90 sm:px-5">
          {result.summary || t('cv.report.emptySummary')}
        </p>

        <div className="mt-5 grid gap-2 rounded-xl border border-satin/70 bg-surface-overlay/60 p-3 sm:grid-cols-3 sm:gap-0">
          <div className="flex items-center gap-3 px-2 py-2 sm:border-r sm:border-satin/70">
            <BriefcaseBusiness className="size-4 text-info-light" aria-hidden />
            <span>
              <span className="block text-[11px] text-muted-foreground">{t('cv.report.domain')}</span>
              <span className="block text-sm font-semibold text-foreground">
                {formatJobCategoryDisplay(result.jobCategory, language) || t('cv.landing.untitledDomain')}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3 px-2 py-2 sm:border-r sm:border-satin/70 sm:pl-5">
            <FileText className="size-4 text-info-light" aria-hidden />
            <span>
              <span className="block text-[11px] text-muted-foreground">{t('cv.report.jdStatus')}</span>
              <span className="block text-sm font-semibold text-foreground">
                {result.jdId ? t('cv.report.jdUploaded') : t('cv.report.noJd')}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3 px-2 py-2 sm:pl-5">
            <CalendarClock className="size-4 text-info-light" aria-hidden />
            <span>
              <span className="block text-[11px] text-muted-foreground">{t('cv.report.analysisTime')}</span>
              <span className="block text-sm font-semibold text-foreground">{formatDate(result.createdAt, language)}</span>
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <CvReportSourceActions analysis={result} meta={meta} onOpenCv={onOpenCv} onOpenJd={onOpenJd} />

          <div className="flex flex-wrap gap-2">
            <Link to="/candidate/cv/analysis" className="btn-primary inline-flex text-sm">
              {t('cv.startNewAnalysis')} <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link to="/practice" className="btn-secondary inline-flex text-sm">{t('cv.landing.practiceCta')}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
