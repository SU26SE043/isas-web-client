import React from 'react';
import { useLanguage } from '../../../../shared/languages';

interface InterviewHistoryToolbarProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onRefresh: () => void;
  dateFilter?: string;
  onClearDateFilter?: () => void;
}

export const InterviewHistoryToolbar: React.FC<InterviewHistoryToolbarProps> = ({
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  dateFilter,
  onClearDateFilter,
}) => {
  const { t } = useLanguage();

  return (
    <div className="mb-5 flex flex-shrink-0 items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-56">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="w-full pl-4 pr-10 py-2 border border-subtle rounded-lg text-sm bg-surface-raised focus:outline-none focus:ring-1 focus:ring-[var(--border-focus)] appearance-none shadow-sm cursor-pointer"
        >
          <option value="">{t('practice.history.filterStatus')}</option>
          <option value="completed">{t('practice.history.status.completed')}</option>
          <option value="in-progress">{t('practice.history.status.inProgress')}</option>
          <option value="pending">{t('practice.history.status.pending')}</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        </div>
        {dateFilter && onClearDateFilter ? (
          <button
            type="button"
            onClick={onClearDateFilter}
            className="inline-flex items-center gap-2 rounded-lg border border-subtle bg-surface-raised px-3 py-2 text-sm text-foreground transition hover:bg-surface-overlay"
          >
            <span>{t('practice.history.filterDate')}: {dateFilter}</span>
            <span className="text-muted-foreground" aria-hidden>
              ×
            </span>
            <span className="sr-only">{t('practice.history.clearDateFilter')}</span>
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="flex items-center justify-center w-10 h-10 bg-surface-raised border border-subtle text-muted-foreground rounded-lg hover:bg-surface-overlay transition-all shadow-sm"
        aria-label={t('practice.history.refresh')}
        title={t('practice.history.refresh')}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  );
};
