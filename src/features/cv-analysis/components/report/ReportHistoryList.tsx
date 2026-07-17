import React from 'react';
import { Eye } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { formatJobCategoryDisplay } from '@/shared/domain/jobDomains';
import type { CvAnalysisResult } from '../../types/cvAnalysis.types';

interface ReportHistoryListProps {
  items: CvAnalysisResult[];
  selectedId?: string;
  isLoading?: boolean;
  onSelect: (item: CvAnalysisResult) => void;
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

export const ReportHistoryList: React.FC<ReportHistoryListProps> = ({
  items,
  selectedId,
  isLoading = false,
  onSelect,
}) => {
  const { language, t } = useLanguage();

  return (
    <aside className="frame-satin rounded-3xl bg-[var(--glass-bg)] p-5 backdrop-blur-xl sm:p-6">
      <h2 className="text-base font-semibold tracking-tight text-foreground">{t('cv.report.history')}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t('cv.report.historyDesc')}</p>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">{t('cv.report.historyLoading')}</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{t('cv.report.historyEmpty')}</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((item) => {
            const selected = item.id === selectedId;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className={
                    selected
                      ? 'w-full rounded-2xl border border-satin bg-white/[0.08] px-4 py-3 text-left shadow-[var(--satin-inset)]'
                      : 'w-full rounded-2xl border border-satin bg-white/[0.02] px-4 py-3 text-left transition-colors hover:bg-white/[0.05]'
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {formatJobCategoryDisplay(item.jobCategory, language) ||
                          t('cv.report.domain')}
                      </p>
                      <p className="mt-1 text-caption text-muted-foreground">
                        {formatDate(item.createdAt, language)}
                      </p>
                      <p className="mt-2 text-caption text-muted-foreground">
                        {item.jdId ? t('cv.report.jdUploaded') : t('cv.report.noJd')}
                        {item.jdMatch
                          ? ` · ${t('cv.report.matchScoreShort').replace('{score}', String(item.jdMatch.score))}`
                          : ''}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-satin px-2 py-1 text-caption text-foreground">
                      <Eye className="size-3.5" aria-hidden />
                      {t('cv.report.view')}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
};
