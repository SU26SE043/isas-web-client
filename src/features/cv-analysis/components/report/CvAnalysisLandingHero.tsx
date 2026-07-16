import { ArrowRight, CalendarClock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import type { AnalysisFileMeta, CvAnalysisResult } from '../../types/cvAnalysis.types';
import { CvMatchScoreRing } from './CvMatchScoreRing';

interface CvAnalysisLandingHeroProps {
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

export function CvAnalysisLandingHero({ result, meta }: CvAnalysisLandingHeroProps) {
  const { language, t } = useLanguage();
  const score = result.jdMatch?.score;

  return (
    <section className="relative overflow-hidden rounded-3xl frame-satin bg-surface-raised">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_55%)]"
      />
      <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.2fr_auto] lg:items-center lg:gap-12 lg:p-12">
        <div className="space-y-6">
          <p className="text-label text-muted-foreground">{t('cv.landing.kicker')}</p>
          <div className="space-y-3">
            <h1 className="heading-primary text-4xl tracking-tight text-foreground sm:text-5xl">
              {result.jobCategory || t('cv.landing.untitledDomain')}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {result.summary || t('cv.report.emptySummary')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-satin bg-surface-overlay px-3 py-1.5">
              <Sparkles className="size-3.5 text-foreground" aria-hidden />
              {t('cv.report.statusReady')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-3.5" aria-hidden />
              {formatDate(result.createdAt, language)}
            </span>
            {meta?.cvFileName ? (
              <span className="truncate rounded-md border border-satin bg-surface-overlay px-3 py-1.5 text-foreground">
                {meta.cvFileName}
              </span>
            ) : null}
            {result.jdId ? (
              <span className="rounded-md border border-satin bg-surface-overlay px-3 py-1.5">
                {meta?.jdFileName || t('cv.report.jdUploaded')}
              </span>
            ) : (
              <span className="rounded-md border border-satin bg-surface-overlay px-3 py-1.5">
                {t('cv.report.noJd')}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/candidate/cv/analysis" className="btn-primary inline-flex rounded-md">
              {t('cv.startNewAnalysis')}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link to="/practice" className="btn-secondary inline-flex rounded-md">
              {t('cv.landing.practiceCta')}
            </Link>
          </div>
        </div>

        {score != null ? (
          <div className="flex flex-col items-center gap-3 justify-self-center lg:justify-self-end">
            <CvMatchScoreRing score={score} className="size-44 [&_svg]:size-44" />
            <p className="text-sm text-muted-foreground">{t('cv.landing.matchLabel')}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
