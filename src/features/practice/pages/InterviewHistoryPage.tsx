import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../shared/languages';
import { fetchInterviewHistory } from '../services/history.service';
import type { InterviewHistoryItem } from '../types/history.types';

const statusConfig = {
  completed: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'practice.history.status.completed',
  },
  'in-progress': {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    label: 'practice.history.status.inProgress',
  },
  pending: {
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    label: 'practice.history.status.pending',
  },
};

const getCompanyInitials = (company: string) => {
  return company
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getCompanyColor = (index: number) => {
  const colors = [
    'bg-blue-600',
    'bg-purple-600',
    'bg-orange-600',
    'bg-rose-600',
    'bg-teal-600',
    'bg-indigo-600',
  ];
  return colors[index % colors.length];
};

export const InterviewHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
  });

  const itemsPerPage = 10;

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
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
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

  const calculateStats = () => {
    const total = interviews.length;
    const completed = interviews.filter((i) => i.status === 'completed').length;
    const inProgress = interviews.filter((i) => i.status === 'in-progress').length;
    const avgScore =
      interviews.length > 0
        ? Math.round(
            interviews.filter((i) => i.overallScore > 0).reduce((sum, i) => sum + i.overallScore, 0) /
              interviews.filter((i) => i.overallScore > 0).length
          )
        : 0;

    return { total, completed, inProgress, avgScore };
  };

  const filteredInterviews = interviews.filter((interview) => {
    if (filters.status && interview.status !== filters.status) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const paginatedInterviews = filteredInterviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pine"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-white">
      {/* Hero Section */}
      <div 
        className="relative px-6 py-8 md:py-10 overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col justify-center items-center text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            {t('practice.history.title')}
          </h1>
          <p className="text-white/90 text-base md:text-lg">
            {t('practice.history.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Filter & Refresh Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-4 bg-slate-50 rounded-lg">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, status: e.target.value }));
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-milk"
            >
              <option value="">{t('practice.history.filterStatus')}</option>
              <option value="completed">{t('practice.history.status.completed')}</option>
              <option value="in-progress">{t('practice.history.status.inProgress')}</option>
              <option value="pending">{t('practice.history.status.pending')}</option>
            </select>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-milk text-pine font-medium rounded-lg hover:bg-opacity-90 transition-all text-sm md:text-base"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {t('practice.history.refresh')}
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">{t('practice.history.totalInterviews')}</p>
                <p className="text-3xl font-black text-blue-600">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">{t('practice.history.completed')}</p>
                <p className="text-3xl font-black text-emerald-600">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-6 border border-amber-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">{t('practice.history.averageScore')}</p>
                <p className="text-3xl font-black text-amber-600">{stats.avgScore}%</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">{t('practice.history.inProgress')}</p>
                <p className="text-3xl font-black text-purple-600">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Interview List */}
        {paginatedInterviews.length > 0 ? (
          <div className="space-y-4">
            {paginatedInterviews.map((interview, index) => (
              <div
                key={interview.id}
                className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleInterviewClick(interview.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Company Avatar */}
                  <div
                    className={`w-12 h-12 ${getCompanyColor(index)} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white font-bold text-sm">{getCompanyInitials(interview.company)}</span>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-pine transition-colors truncate">
                          {interview.jobTitle}
                        </h3>
                        <p className="text-sm text-slate-500">{interview.company}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${
                          statusConfig[interview.status].badge
                        }`}
                      >
                        {getStatusLabel(interview.status)}
                      </span>
                    </div>

                    {/* Details Row */}
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400 text-xs uppercase tracking-wide block mb-1">
                          {t('practice.history.date')}
                        </span>
                        <span className="text-slate-700 font-medium text-sm">{formatDate(interview.date)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs uppercase tracking-wide block mb-1">
                          {t('practice.history.duration')}
                        </span>
                        <span className="text-slate-700 font-medium text-sm">{formatDuration(interview.duration)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs uppercase tracking-wide block mb-1">
                          {t('practice.history.score')}
                        </span>
                        <span
                          className={`font-semibold text-sm ${
                            interview.overallScore > 0 ? 'text-emerald-600' : 'text-slate-500'
                          }`}
                        >
                          {interview.overallScore > 0 ? `${interview.overallScore}%` : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-lg border border-slate-200">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('practice.history.emptyTitle')}</h3>
            <p className="text-slate-600">{t('practice.history.emptyDesc')}</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  currentPage === page
                    ? 'bg-milk text-pine'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Page Info */}
        {totalPages > 0 && (
          <div className="text-center mt-4 text-sm text-slate-600">
            {t('practice.history.pagination')} {currentPage} / {totalPages}
          </div>
        )}
      </div>
    </div>
  );
};