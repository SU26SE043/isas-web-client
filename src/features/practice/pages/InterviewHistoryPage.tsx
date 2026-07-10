import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewHistory } from '../hooks/useInterviewHistory';
import { InterviewHistoryEmptyState } from '../components/history/InterviewHistoryEmptyState';
import { InterviewHistoryHeader } from '../components/history/InterviewHistoryHeader';
import { InterviewHistoryListItem } from '../components/history/InterviewHistoryListItem';
import { InterviewHistoryPagination } from '../components/history/InterviewHistoryPagination';
import { InterviewHistoryStats } from '../components/history/InterviewHistoryStats';
import { InterviewHistoryToolbar } from '../components/history/InterviewHistoryToolbar';
import {
  computeHistoryStats,
  HISTORY_ITEMS_PER_PAGE,
} from '../components/history/historyPageUtils';

export const InterviewHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { interviews, isLoading, refresh } = useInterviewHistory();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const stats = useMemo(() => computeHistoryStats(interviews), [interviews]);

  const filteredInterviews = useMemo(
    () => interviews.filter((interview) => !statusFilter || interview.status === statusFilter),
    [interviews, statusFilter],
  );

  const totalPages = Math.ceil(filteredInterviews.length / HISTORY_ITEMS_PER_PAGE);
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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-raised">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-subtle" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-surface-raised overflow-hidden">
      <InterviewHistoryHeader />

      <div className="flex-1 flex flex-col min-h-0 px-8 py-5 max-w-[1400px] w-full mx-auto">
        <InterviewHistoryToolbar
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onRefresh={handleRefresh}
        />

        <InterviewHistoryStats
          total={stats.total}
          completed={stats.completed}
          avgScore={stats.avgScore}
          inProgress={stats.inProgress}
        />

        <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
          {paginatedInterviews.length > 0 ? (
            paginatedInterviews.map((interview, index) => (
              <InterviewHistoryListItem
                key={interview.id}
                interview={interview}
                index={index}
                onSelect={(id) => navigate(`/practice/history/${id}`)}
              />
            ))
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
