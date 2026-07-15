import React, { useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { useInterviewHistory } from '../hooks/useInterviewHistory';
import { HistoryTable } from '../components/history/HistoryTable';
import { InterviewHistoryCompareBar } from '../components/history/InterviewHistoryCompareBar';
import { InterviewHistoryEmptyState } from '../components/history/InterviewHistoryEmptyState';
import { InterviewHistoryHeader } from '../components/history/InterviewHistoryHeader';
import { InterviewHistoryPagination } from '../components/history/InterviewHistoryPagination';
import { InterviewHistoryStats } from '../components/history/InterviewHistoryStats';
import { InterviewHistoryToolbar } from '../components/history/InterviewHistoryToolbar';
import {
  computeHistoryStats,
  HISTORY_ITEMS_PER_PAGE,
} from '../components/history/historyPageUtils';

export const InterviewHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const dateFilter = searchParams.get('date') ?? '';
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showHidden, setShowHidden] = useState(false);

  const { interviews, isLoading, error, refresh, hideInterview, restoreHiddenInterview } =
    useInterviewHistory({ includeDeleted: showHidden });

  const stats = useMemo(() => computeHistoryStats(interviews), [interviews]);

  const filteredInterviews = useMemo(
    () =>
      interviews.filter((interview) => {
        const matchesStatus = !statusFilter || interview.status === statusFilter;
        const matchesDate = !dateFilter || interview.date.startsWith(dateFilter);
        return matchesStatus && matchesDate;
      }),
    [interviews, statusFilter, dateFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filteredInterviews.length / HISTORY_ITEMS_PER_PAGE));
  const paginatedInterviews = filteredInterviews.slice(
    (currentPage - 1) * HISTORY_ITEMS_PER_PAGE,
    currentPage * HISTORY_ITEMS_PER_PAGE,
  );

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    refresh();
  };

  const handleClearDateFilter = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('date');
    setSearchParams(nextParams);
    setCurrentPage(1);
  };

  const handleToggleCompareMode = () => {
    setCompareMode((value) => !value);
    setSelectedIds([]);
  };

  const handleToggleCompare = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= 2) {
        return [current[1], id];
      }
      return [...current, id];
    });
  };

  const handleCompare = () => {
    if (selectedIds.length !== 2) return;
    navigate(`/candidate/practice/history/compare?left=${selectedIds[0]}&right=${selectedIds[1]}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-raised">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-subtle" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-surface-raised px-6 text-center">
        <AlertCircle className="h-10 w-10 text-error" aria-hidden />
        <h2 className="heading-secondary mt-4 text-xl text-foreground">{t('practice.history.errorTitle')}</h2>
        <p className="body-text mt-2 text-sm text-muted-foreground">{t('practice.history.errorDescription')}</p>
        <button type="button" className="btn-primary mt-6" onClick={handleRefresh}>
          {t('practice.history.refresh')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-raised">
      <InterviewHistoryHeader />

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-8 py-5 min-h-0">
        <InterviewHistoryToolbar
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onRefresh={handleRefresh}
          dateFilter={dateFilter}
          onClearDateFilter={dateFilter ? handleClearDateFilter : undefined}
          compareMode={compareMode}
          onToggleCompareMode={handleToggleCompareMode}
          showHidden={showHidden}
          onToggleShowHidden={() => {
            setShowHidden((value) => !value);
            setCurrentPage(1);
          }}
        />

        {compareMode ? (
          <InterviewHistoryCompareBar
            selectedCount={selectedIds.length}
            onCompare={handleCompare}
            onCancel={handleToggleCompareMode}
          />
        ) : null}

        <InterviewHistoryStats
          total={stats.total}
          completed={stats.completed}
          avgScore={stats.avgScore}
          inProgress={stats.inProgress}
        />

        <div className="min-h-0 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {paginatedInterviews.length > 0 ? (
            <HistoryTable
              interviews={paginatedInterviews}
              compareMode={compareMode}
              selectedIds={selectedIds}
              showHidden={showHidden}
              onSelect={(id) => navigate(`/candidate/practice/history/${id}`)}
              onToggleCompare={handleToggleCompare}
              onHide={(id) => void hideInterview(id)}
              onRestore={(id) => void restoreHiddenInterview(id)}
            />
          ) : (
            <InterviewHistoryEmptyState />
          )}
        </div>

        <InterviewHistoryPagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={HISTORY_ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
