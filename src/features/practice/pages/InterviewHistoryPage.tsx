import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../shared/languages';
import { fetchInterviewHistory } from '../services/history.service';
import type { InterviewHistoryItem } from '../types/history.types';

const statusConfig = {
  completed: {
    badge: 'bg-emerald-50 text-emerald-600',
    label: 'practice.history.status.completed',
  },
  'in-progress': {
    badge: 'bg-amber-50 text-amber-600',
    label: 'practice.history.status.inProgress',
  },
  pending: {
    badge: 'bg-slate-100 text-slate-500',
    label: 'practice.history.status.pending',
  },
};

const getCompanyInitials = (company: string) => {
  return company.charAt(0).toUpperCase();
};

const getCompanyColor = (index: number) => {
  const colors = [
    'bg-blue-600',
    'bg-purple-600',
    'bg-orange-600',
    'bg-emerald-600',
    'bg-indigo-600',
  ];
  return colors[index % colors.length];
};

// Icons components
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export const InterviewHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // Use 5 items to fit well on standard screens without scrolling
  const itemsPerPage = 5;

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
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date).replace(',', '');
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const handleInterviewClick = (id: string) => {
    navigate(`/practice/result/${id}`);
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
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pine"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Header Section */}
      <div className="flex-shrink-0 relative h-28 md:h-32 bg-gradient-to-r from-[#F0FDF4] to-[#DCFCE7] overflow-hidden">
        <div className="absolute inset-0 right-0 bg-[url('/history-bg.jpg')] bg-right bg-no-repeat bg-contain opacity-50"></div>
        <div className="absolute inset-0 px-8 flex flex-col justify-center z-10 max-w-[1400px] mx-auto w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">
            {t('practice.history.title')}
          </h1>
          <p className="text-sm text-slate-600">
            {t('practice.history.subtitle')}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 px-8 py-5 max-w-[1400px] w-full mx-auto">
        {/* Filter and Refresh */}
        <div className="flex-shrink-0 flex justify-between items-center mb-5">
          <div className="w-56 relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 appearance-none shadow-sm cursor-pointer"
            >
              <option value="">{t('practice.history.filterStatus')}</option>
              <option value="completed">{t('practice.history.status.completed')}</option>
              <option value="in-progress">{t('practice.history.status.inProgress')}</option>
              <option value="pending">{t('practice.history.status.pending')}</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
            aria-label={t('practice.history.refresh')}
            title={t('practice.history.refresh')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="flex-shrink-0 grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#F4F8FF] rounded-xl p-4 flex items-center border border-transparent">
            <div className="w-12 h-12 rounded-lg bg-[#E0EFFF] text-blue-600 flex items-center justify-center mr-4 shadow-sm shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] md:text-xs text-slate-600 font-medium mb-0.5">{t('practice.history.totalInterviews')}</p>
              <p className="text-xl md:text-2xl font-bold text-blue-600 leading-none">{stats.total}</p>
            </div>
          </div>
          
          <div className="bg-[#F0FDF4] rounded-xl p-4 flex items-center border border-transparent">
            <div className="w-12 h-12 rounded-lg bg-[#DCFCE7] text-emerald-600 flex items-center justify-center mr-4 shadow-sm shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] md:text-xs text-slate-600 font-medium mb-0.5">{t('practice.history.completed')}</p>
              <p className="text-xl md:text-2xl font-bold text-emerald-600 leading-none">{stats.completed}</p>
            </div>
          </div>

          <div className="bg-[#FFFBEB] rounded-xl p-4 flex items-center border border-transparent">
            <div className="w-12 h-12 rounded-lg bg-[#FEF3C7] text-amber-500 flex items-center justify-center mr-4 shadow-sm shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] md:text-xs text-slate-600 font-medium mb-0.5">{t('practice.history.averageScore')}</p>
              <p className="text-xl md:text-2xl font-bold text-amber-500 leading-none">{stats.avgScore}%</p>
            </div>
          </div>

          <div className="bg-[#FAF5FF] rounded-xl p-4 flex items-center border border-transparent">
            <div className="w-12 h-12 rounded-lg bg-[#F3E8FF] text-purple-600 flex items-center justify-center mr-4 shadow-sm shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] md:text-xs text-slate-600 font-medium mb-0.5">{t('practice.history.inProgress')}</p>
              <p className="text-xl md:text-2xl font-bold text-purple-600 leading-none">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        {/* List items - fills available height */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
          {paginatedInterviews.length > 0 ? (
            paginatedInterviews.map((interview, index) => (
              <div
                key={interview.id}
                className="flex items-center border border-slate-200 rounded-xl px-5 py-4 bg-white hover:shadow-md transition-all cursor-pointer group shrink-0"
                onClick={() => handleInterviewClick(interview.id)}
              >
                {/* Avatar & Title */}
                <div className="w-1/3 flex items-center min-w-0 pr-4">
                  <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${getCompanyColor(index)} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                    {getCompanyInitials(interview.jobTitle || interview.company)}
                  </div>
                  <div className="ml-4 truncate">
                    <h3 className="font-bold text-slate-800 text-[15px] group-hover:text-pine transition-colors truncate">
                      {interview.jobTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{interview.company}</p>
                  </div>
                </div>

                {/* Info columns */}
                <div className="flex-1 flex items-center justify-between px-4">
                  {/* Date */}
                  <div className="w-36 flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">{t('practice.history.date')}</span>
                    <div className="flex items-center text-[13px] text-slate-600 font-medium">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400 mr-1.5"/>
                      {formatDate(interview.date)}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="w-24 flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">{t('practice.history.duration')}</span>
                    <div className="flex items-center text-[13px] text-slate-600 font-medium">
                      <ClockIcon className="w-3.5 h-3.5 text-slate-400 mr-1.5"/>
                      {formatDuration(interview.duration)}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="w-24 flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">{t('practice.history.score')}</span>
                    <div className="flex items-center text-[13px] font-bold">
                      <StarIcon className={`w-3.5 h-3.5 mr-1.5 ${interview.overallScore > 0 ? 'text-emerald-500' : 'text-slate-300'}`}/>
                      <span className={interview.overallScore > 0 ? 'text-emerald-600' : 'text-slate-400'}>
                        {interview.overallScore > 0 ? `${interview.overallScore}%` : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="w-48 flex items-center justify-end gap-5 pl-4 shrink-0">
                  <span className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${statusConfig[interview.status].badge}`}>
                    {getStatusLabel(interview.status)}
                  </span>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 group-hover:border-slate-300 group-hover:bg-slate-50 transition-colors">
                    <ChevronRightIcon className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
              <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-semibold text-slate-600">{t('practice.history.emptyTitle')}</p>
              <p className="text-xs mt-1">{t('practice.history.emptyDesc')}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex-shrink-0 pt-5 flex items-center justify-between border-t border-slate-100 mt-2">
            <div className="w-32"></div> {/* Spacer for center alignment */}
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-[#DCFCE7] text-emerald-700 font-bold border border-transparent'
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="w-32 flex justify-end">
              <div className="relative">
                <select className="pl-3 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white appearance-none focus:outline-none cursor-pointer shadow-sm">
                  <option>{itemsPerPage} / trang</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};