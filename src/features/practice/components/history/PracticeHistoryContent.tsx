import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import type { PracticeSessionHistoryItem } from '../../types/history.types';
import { PracticeHistoryPagination } from './PracticeHistoryPagination';
import { PracticeHistoryTable } from './PracticeHistoryTable';

interface PracticeHistoryContentProps {
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  pageItems: PracticeSessionHistoryItem[];
  visibleItems: PracticeSessionHistoryItem[];
  hasClientFilters: boolean;
  compareMode: boolean;
  selectedIds: string[];
  pageIndex: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
  onToggleCompare: (id: string) => void;
  onViewResult: (id: string) => void;
  onResume: (id: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function PracticeHistoryContent({
  isLoading,
  isError,
  isFetching,
  pageItems,
  visibleItems,
  hasClientFilters,
  compareMode,
  selectedIds,
  pageIndex,
  canGoPrevious,
  canGoNext,
  onRetry,
  onClearFilters,
  onToggleCompare,
  onViewResult,
  onResume,
  onPrevious,
  onNext,
}: PracticeHistoryContentProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="space-y-3" aria-live="polite">
        <p className="text-sm text-muted-foreground">{t('practice.history.loading')}</p>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded-xl border border-satin bg-surface-overlay"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-3">
        <Alert variant="error">
          <AlertDescription>{t('practice.history.errorDescription')}</AlertDescription>
        </Alert>
        <Button type="button" variant="outline" onClick={onRetry}>
          {t('practice.history.refresh')}
        </Button>
      </div>
    );
  }

  if (pageItems.length === 0) {
    return (
      <EmptyState
        variant="no-data"
        title={t('practice.history.emptyTitle')}
        description={t('practice.history.emptyDesc')}
        action={
          <Button type="button" render={<Link to="/practice" />}>
            {t('practice.history.newPractice')}
          </Button>
        }
      />
    );
  }

  if (visibleItems.length === 0) {
    return (
      <EmptyState
        variant="no-results"
        title={t('practice.history.emptyFilteredTitle')}
        description={t('practice.history.emptyFilteredDesc')}
        action={
          hasClientFilters ? (
            <Button type="button" variant="outline" onClick={onClearFilters}>
              {t('practice.history.clearFilters')}
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-satin bg-surface-raised p-4">
      {isFetching ? (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {t('practice.history.loadingSoft')}
        </p>
      ) : null}
      <PracticeHistoryTable
        items={visibleItems}
        compareMode={compareMode}
        selectedIds={selectedIds}
        onToggleCompare={onToggleCompare}
        onViewResult={onViewResult}
        onResume={onResume}
      />
      <PracticeHistoryPagination
        pageIndex={pageIndex}
        itemCount={pageItems.length}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        isFetching={isFetching}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </div>
  );
}
