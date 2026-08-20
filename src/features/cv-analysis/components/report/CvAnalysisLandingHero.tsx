import { ArrowRight, CalendarClock, Sparkles } from 'lucide-react';
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
    <section className="relative overflow-hidden rounded-3xl frame-satin bg-surface-raised">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_55%)]"
      />
      <div className="relative p-6 sm:p-10 lg:p-12">
        <div className="max-w-3xl space-y-6">
          <p className="text-label text-muted-foreground">{t('cv.landing.kicker')}</p>
          <div className="space-y-3">
            <h1 className="heading-primary text-4xl tracking-tight text-foreground sm:text-5xl">
              {formatJobCategoryDisplay(result.jobCategory, language) ||
                t('cv.landing.untitledDomain')}
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
          </div>

          <CvReportSourceActions
            analysis={result}
            meta={meta}
            onOpenCv={onOpenCv}
            onOpenJd={onOpenJd}
          />

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
      </div>
    </section>
  );
}
