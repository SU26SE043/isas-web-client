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
  /** Original CV file name resolved from `item.cvId`; omitted when the file was deleted. */
  cvFileName?: string;
}

function formatDate(iso: string, language: 'vi' | 'en') {
  return new Date(iso).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function CvAnalysisAccordionItem({
  item,
  isOpen,
  onToggle,
  cvFileName,
}: CvAnalysisAccordionItemProps) {
  const { language, t } = useLanguage();
  const detailQuery = useCvAnalysisDetail(item.id, isOpen);
  const category = formatJobCategoryDisplay(item.jobCategory, language) || item.jobCategory;
  const panelId = `cv-analysis-panel-${item.id}`;
  const headerId = `cv-analysis-header-${item.id}`;
  const hasJd = item.jdMatch != null || Boolean(item.jdId);
  const jdLabel = hasJd ? t('cv.report.withJd') : t('cv.report.withoutJd');

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
            {/* Falls back to the JD label alone when the CV file was deleted —
                the raw cvId is never surfaced. Stacks on narrow screens so a
                long file name cannot hide the JD label behind an ellipsis. */}
            <span className="flex flex-col text-xs text-zinc-400 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-1.5">
              {cvFileName ? (
                <span className="min-w-0 max-w-full truncate" title={cvFileName}>
                  {cvFileName}
                </span>
              ) : null}
              <span className="shrink-0">
                {cvFileName ? (
                  <span aria-hidden className="mr-1.5 hidden sm:inline">
                    ·
                  </span>
                ) : null}
                {jdLabel}
              </span>
            </span>
            <span className="block text-xs text-zinc-500">{formatDate(item.createdAt, language)}</span>
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
