import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AppPagination } from '@/components/ui/app-pagination';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import type { PracticeSessionHistoryItem } from '../../types/history.types';
import { PracticeHistoryTable } from './PracticeHistoryTable';

interface PracticeHistoryContentProps {
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  pageItems: PracticeSessionHistoryItem[];
  visibleItems: PracticeSessionHistoryItem[];
  /**
   * Có bộ lọc nào đang bật không — GỒM CẢ bộ lọc chạy phía server (`source`), không chỉ bộ lọc
   * phía client. Tên cũ `hasClientFilters` nay sẽ nói dối.
   */
  hasActiveFilters: boolean;
  compareMode: boolean;
  selectedIds: string[];
  pageIndex: number;
  pageSize: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
  onToggleCompare: (id: string) => void;
  onViewResult: (id: string) => void;
  onResume: (id: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onPageSizeChange: (value: number) => void;
}

export function PracticeHistoryContent({
  isLoading,
  isError,
  isFetching,
  pageItems,
  visibleItems,
  hasActiveFilters,
  compareMode,
  selectedIds,
  pageIndex,
  pageSize,
  canGoPrevious,
  canGoNext,
  onRetry,
  onClearFilters,
  onToggleCompare,
  onViewResult,
  onResume,
  onPrevious,
  onNext,
  onPageSizeChange,
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

  // 🔴 Bộ lọc `source` chạy phía SERVER, nên lọc không ra gì làm `pageItems` RỖNG — rơi thẳng vào
  // ô "bạn chưa có buổi luyện nào" kèm nút "Luyện tập mới". Với người có sẵn 3 buổi mà vừa bấm
  // "Theo lộ trình", đó là một câu nói dối, và nút nó đưa ra cũng sai việc. Còn bộ lọc thì phải
  // rơi xuống nhánh "không tìm thấy phiên phù hợp" bên dưới — nhánh có nút xoá lọc.
  if (pageItems.length === 0 && !hasActiveFilters) {
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
          hasActiveFilters ? (
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
      <AppPagination
        mode="cursor"
        currentPage={pageIndex}
        pageSize={pageSize}
        itemCount={pageItems.length}
        itemLabel={t('practice.history.pagination.itemLabel')}
        hasPreviousPage={canGoPrevious}
        hasNextPage={canGoNext}
        isLoading={isFetching}
        onPageSizeChange={onPageSizeChange}
        onPreviousPage={onPrevious}
        onNextPage={onNext}
      />
    </div>
  );
}
