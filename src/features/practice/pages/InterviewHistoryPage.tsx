import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { InterviewHistoryCompareBar } from '../components/history/InterviewHistoryCompareBar';
import { PracticeHistoryContent } from '../components/history/PracticeHistoryContent';
import { PracticeHistoryStatCard } from '../components/history/PracticeHistoryStatCard';
import { PracticeHistoryToolbar } from '../components/history/PracticeHistoryToolbar';
import { usePracticeSessionHistory } from '../hooks/usePracticeSessionHistory';
import type {
  PracticeHistorySort,
  PracticeHistoryStatusFilter,
} from '../types/history.types';
import {
  computePracticeHistoryPageStats,
  filterAndSortPracticeHistory,
} from '../utils/practiceSessionHistoryActions';

export function InterviewHistoryPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const dateFilter = searchParams.get('date') ?? '';

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PracticeHistoryStatusFilter>('all');
  const [sort, setSort] = useState<PracticeHistorySort>('newest');
  const [pageSize, setPageSize] = useState(20);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<Array<string | null>>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const historyQuery = usePracticeSessionHistory({
    cursor: currentCursor ?? undefined,
    limit: pageSize,
  });

  const nextCursor = historyQuery.data?.nextCursor ?? null;
  const pageItems = historyQuery.data?.items ?? [];
  const stats = useMemo(() => computePracticeHistoryPageStats(pageItems), [pageItems]);

  const visibleItems = useMemo(
    () =>
      filterAndSortPracticeHistory(pageItems, {
        search,
        status,
        sort,
        datePrefix: dateFilter || undefined,
      }),
    [dateFilter, pageItems, search, sort, status],
  );

  const hasClientFilters =
    Boolean(search.trim()) || status !== 'all' || sort !== 'newest' || Boolean(dateFilter);

  const resetPagination = () => {
    setCurrentCursor(null);
    setCursorHistory([]);
    setPageIndex(1);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setSort('newest');
    if (dateFilter) {
      const next = new URLSearchParams(searchParams);
      next.delete('date');
      setSearchParams(next);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-6xl space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {t('practice.history.title')}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('practice.history.subtitle')}</p>
          </div>
          <Button type="button" render={<Link to="/practice" />}>
            {t('practice.history.newPractice')}
          </Button>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PracticeHistoryStatCard
            label={t('practice.history.stats.pageCount')}
            value={String(stats.pageCount)}
          />
          <PracticeHistoryStatCard
            label={t('practice.history.stats.pageCompleted')}
            value={String(stats.completed)}
          />
          <PracticeHistoryStatCard
            label={t('practice.history.stats.pageInProgress')}
            value={String(stats.inProgress)}
          />
          <PracticeHistoryStatCard
            label={t('practice.history.stats.pageAvgScore')}
            value={
              stats.avgScore == null
                ? t('practice.history.scoreUnavailable')
                : stats.avgScore.toFixed(1)
            }
          />
        </div>

        <PracticeHistoryToolbar
          search={search}
          status={status}
          sort={sort}
          isFetching={historyQuery.isFetching}
          compareMode={compareMode}
          dateFilter={dateFilter || undefined}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onSortChange={setSort}
          onRefresh={() => void historyQuery.refetch()}
          onToggleCompareMode={() => {
            setCompareMode((value) => !value);
            setSelectedIds([]);
          }}
          onClearDateFilter={() => {
            const next = new URLSearchParams(searchParams);
            next.delete('date');
            setSearchParams(next);
          }}
        />

        {compareMode ? (
          <InterviewHistoryCompareBar
            selectedCount={selectedIds.length}
            onCompare={() => {
              if (selectedIds.length !== 2) return;
              navigate(
                `/candidate/practice/history/compare?left=${selectedIds[0]}&right=${selectedIds[1]}`,
              );
            }}
            onCancel={() => {
              setCompareMode(false);
              setSelectedIds([]);
            }}
          />
        ) : null}

        {historyQuery.data || historyQuery.isLoading || historyQuery.isError ? (
          <PracticeHistoryContent
            isLoading={historyQuery.isLoading}
            isError={historyQuery.isError}
            isFetching={historyQuery.isFetching}
            pageItems={pageItems}
            visibleItems={visibleItems}
            hasClientFilters={hasClientFilters}
            compareMode={compareMode}
            selectedIds={selectedIds}
            pageIndex={pageIndex}
            pageSize={pageSize}
            canGoPrevious={cursorHistory.length > 0}
            canGoNext={Boolean(nextCursor)}
            onRetry={() => void historyQuery.refetch()}
            onClearFilters={clearFilters}
            onToggleCompare={(id) => {
              setSelectedIds((current) => {
                if (current.includes(id)) return current.filter((item) => item !== id);
                if (current.length >= 2) return [current[1], id];
                return [...current, id];
              });
            }}
            onViewResult={(id) => navigate(`/candidate/practice/history/${id}`)}
            onResume={(id) => navigate(`/interview/${id}/room`)}
            onPrevious={() => {
              setCursorHistory((previous) => {
                if (previous.length === 0) return previous;
                const updated = [...previous];
                const previousCursor = updated.pop() ?? null;
                setCurrentCursor(previousCursor);
                setPageIndex((page) => Math.max(1, page - 1));
                return updated;
              });
            }}
            onNext={() => {
              if (!nextCursor) return;
              setCursorHistory((previous) => [...previous, currentCursor]);
              setCurrentCursor(nextCursor);
              setPageIndex((previous) => previous + 1);
            }}
            onPageSizeChange={(value) => {
              setPageSize(value);
              resetPagination();
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
