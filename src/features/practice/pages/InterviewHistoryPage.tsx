import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../shared/languages';
import { fetchInterviewHistory } from '../services/history.service';
import type { InterviewHistoryItem } from '../types/history.types';

const statusConfig = {
  completed: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'practice.history.status.completed',
  },
  'in-progress': {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    label: 'practice.history.status.inProgress',
  },
  pending: {
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    label: 'practice.history.status.pending',
  },
};

export const InterviewHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const itemsPerPage = 6;

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        const response = await fetchInterviewHistory();
        setInterviews(response.interviews);
      } catch (error) {
        console.error('Failed to load interviews:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInterviews();
  }, []);

  const getStatusLabel = (status: InterviewHistoryItem['status']) => {
    return t(statusConfig[status].label);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const handleInterviewClick = (id: string) => {
    navigate(`/practice/interview/${id}`);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setCurrentPage(1);
    setInterviews([]);
    const loadInterviews = async () => {
      try {
        const response = await fetchInterviewHistory();
        setInterviews(response.interviews);
      } catch (error) {
        console.error('Failed to load interviews:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInterviews();
  };

  const stats = (() => {
    const total = interviews.length;
    const completed = interviews.filter((i) => i.status === 'completed').length;
    const inProgress = interviews.filter((i) => i.status === 'in-progress').length;
    const scored = interviews.filter((i) => i.overallScore > 0);
    const avgScore = scored.length > 0 ? Math.round(scored.reduce((sum, i) => sum + i.overallScore, 0) / scored.length) : 0;
    return { total, completed, inProgress, avgScore };
  })();

  const filteredInterviews = interviews.filter((interview) => {
    if (statusFilter && interview.status !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const paginatedInterviews = filteredInterviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F1F5F9]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pine"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#F1F5F9]">
      {/* Header Bar */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{t('practice.history.title')}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{t('practice.history.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-milk"
            >
              <option value="">{t('practice.history.filterStatus')}</option>
              <option value="completed">{t('practice.history.status.completed')}</option>
              <option value="in-progress">{t('practice.history.status.inProgress')}</option>
              <option value="pending">{t('practice.history.status.pending')}</option>
            </select>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-milk text-pine font-medium rounded-md hover:bg-opacity-90 transition-all text-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('practice.history.refresh')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex-shrink-0 px-5 pb-3">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-lg px-4 py-3 border border-slate-100">
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{t('practice.history.totalInterviews')}</p>
            <p className="text-2xl font-bold text-blue-600 mt-0.5">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg px-4 py-3 border border-slate-100">
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{t('practice.history.completed')}</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-lg px-4 py-3 border border-slate-100">
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{t('practice.history.averageScore')}</p>
            <p className="text-2xl font-bold text-amber-600 mt-0.5">{stats.avgScore}%</p>
          </div>
          <div className="bg-white rounded-lg px-4 py-3 border border-slate-100">
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{t('practice.history.inProgress')}</p>
            <p className="text-2xl font-bold text-purple-600 mt-0.5">{stats.inProgress}</p>
          </div>
        </div>
      </div>

      {/* Table Area - fills remaining space */}
      <div className="flex-1 min-h-0 px-5 pb-2">
        <div className="bg-white rounded-lg border border-slate-200 h-full flex flex-col">
          {/* Table Header */}
          <div className="flex-shrink-0 grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <div className="col-span-4">{t('practice.history.date')}</div>
            <div className="col-span-3">{t('practice.history.status.completed').replace('Hoàn thành', 'Vị trí')}</div>
            <div className="col-span-2 text-center">{t('practice.history.duration')}</div>
            <div className="col-span-1 text-center">{t('practice.history.score')}</div>
            <div className="col-span-2 text-center">Status</div>
          </div>

          {/* Table Body - scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {paginatedInterviews.length > 0 ? (
              paginatedInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors items-center"
                  onClick={() => handleInterviewClick(interview.id)}
                >
                  <div className="col-span-4">
                    <p className="text-sm font-medium text-slate-800 truncate">{interview.jobTitle}</p>
                    <p className="text-[11px] text-slate-400">{interview.company}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-xs text-slate-600">{formatDate(interview.date)}</p>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-xs text-slate-600">{formatDuration(interview.duration)}</span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className={`text-xs font-semibold ${interview.overallScore > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {interview.overallScore > 0 ? `${interview.overallScore}%` : '-'}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusConfig[interview.status].badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[interview.status].dot}`}></span>
                      {getStatusLabel(interview.status)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
                <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">{t('practice.history.emptyTitle')}</p>
                <p className="text-xs">{t('practice.history.emptyDesc')}</p>
              </div>
            )}
          </div>

          {/* Pagination - fixed at bottom */}
          {totalPages > 0 && (
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                {t('practice.history.pagination')} {currentPage} / {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded text-xs font-medium transition-all ${
                      currentPage === page
                        ? 'bg-milk text-pine'
                        : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};