import { ChevronDown } from 'lucide-react';
import { formatJobCategoryDisplay } from '@/shared/domain/jobDomains';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import { CvAnalysisError } from '../../services/cvAnalysis.service';
import { useCvAnalysisDetail } from '../../hooks/useCvAnalysisDetail';
import type { CvAnalysisResult } from '../../types/cvAnalysis.types';
import { CvAnalysisDetailSkeleton } from './CvAnalysisReportSkeleton';
import { CvAnalysisReportDetail } from './CvAnalysisReportDetail';

interface CvAnalysisAccordionItemProps {
  item: CvAnalysisResult;
  isOpen: boolean;
  onToggle: () => void;
}

function formatDate(iso: string, language: 'vi' | 'en') {
  return new Date(iso).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function matchScoreLabel(score: number | undefined, t: (key: string) => string) {
  if (score == null) return t('cv.report.noJdShort');
  if (score >= 80) return t('cv.report.matchGood');
  if (score >= 60) return t('cv.report.matchFair');
  return t('cv.report.matchLow');
}

export function CvAnalysisAccordionItem({ item, isOpen, onToggle }: CvAnalysisAccordionItemProps) {
  const { language, t } = useLanguage();
  const detailQuery = useCvAnalysisDetail(item.id, isOpen);
  const category = formatJobCategoryDisplay(item.jobCategory, language) || item.jobCategory;
  const panelId = `cv-analysis-panel-${item.id}`;
  const headerId = `cv-analysis-header-${item.id}`;
  const score = item.jdMatch?.score;
  const hasJd = item.jdMatch != null || Boolean(item.jdId);

  const detailError =
    detailQuery.isError && detailQuery.error instanceof CvAnalysisError
      ? detailQuery.error.code === 'forbidden'
        ? t('cv.report.errorForbidden')
        : detailQuery.error.code === 'notFound'
          ? t('cv.report.errorNotFound')
          : t('cv.report.errorDetail')
      : detailQuery.isError
        ? t('cv.report.errorDetail')
        : null;

  return (
    <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70 transition-colors hover:bg-zinc-900">
      <h3 className="m-0">
        <button
          type="button"
          id={headerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
        >
          <span className="min-w-0 space-y-1">
            <span className="block text-sm font-semibold text-zinc-100">{category}</span>
            <span className="block text-xs text-zinc-500">
              {formatDate(item.createdAt, language)} ·{' '}
              {hasJd ? t('cv.report.withJd') : t('cv.report.withoutJd')}
            </span>
            {score != null ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                {t('cv.report.jdMatchScore')}: {score}% · {matchScoreLabel(score, t)}
              </span>
            ) : null}
            <span className="block text-xs font-medium text-zinc-400">{t('cv.report.viewDetail')}</span>
          </span>
          <ChevronDown
            className={cn(
              'mt-0.5 size-4 shrink-0 text-zinc-400 transition-transform motion-reduce:transition-none',
              isOpen && 'rotate-180',
            )}
            aria-hidden
          />
        </button>
      </h3>

      {isOpen ? (
        <div id={panelId} role="region" aria-labelledby={headerId}>
          {detailQuery.isLoading ? <CvAnalysisDetailSkeleton /> : null}
          {detailError ? (
            <div className="space-y-3 border-t border-zinc-800 px-5 py-5">
              <p className="text-sm text-rose-400" role="alert">
                {detailError}
              </p>
              <button
                type="button"
                className="btn-secondary text-sm"
                onClick={() => void detailQuery.refetch()}
              >
                {t('cv.report.retry')}
              </button>
            </div>
          ) : null}
          {detailQuery.data ? <CvAnalysisReportDetail analysis={detailQuery.data} /> : null}
        </div>
      ) : null}
    </article>
  );
}
