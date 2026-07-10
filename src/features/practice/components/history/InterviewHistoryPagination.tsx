import React from 'react';
import { useLanguage } from '../../../../shared/languages';

interface InterviewHistoryPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export const InterviewHistoryPagination: React.FC<InterviewHistoryPaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
}) => {
  const { t } = useLanguage();

  if (totalPages <= 0) return null;

  return (
    <div className="flex-shrink-0 pt-5 flex items-center justify-between border-t border-subtle mt-2">
      <div className="w-32" aria-hidden />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-8 h-8 rounded-lg border border-subtle flex items-center justify-center hover:bg-surface-overlay disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
              currentPage === page
                ? 'bg-surface-elevated text-foreground font-bold border border-default'
                : 'text-muted-foreground hover:bg-surface-overlay border border-transparent'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="w-8 h-8 rounded-lg border border-subtle flex items-center justify-center hover:bg-surface-overlay disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="w-32 flex justify-end">
        <div className="relative">
          <select
            className="pl-3 pr-8 py-1.5 border border-subtle rounded-lg text-xs text-muted-foreground bg-surface-raised appearance-none focus:outline-none cursor-pointer shadow-sm"
            defaultValue={String(itemsPerPage)}
            aria-label={t('common.itemsPerPage')}
          >
            <option value={String(itemsPerPage)}>
              {itemsPerPage} {t('common.perPage')}
            </option>
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
