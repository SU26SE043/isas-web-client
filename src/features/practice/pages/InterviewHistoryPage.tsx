import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../shared/languages';
import { fetchInterviewHistory } from '../services/history.service';
import type { InterviewHistoryItem } from '../types/history.types';

const statusColors = {
  completed: 'bg-green-50 text-green-700 border-green-200',
  'in-progress': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  pending: 'bg-gray-50 text-gray-700 border-gray-200',
};

export const InterviewHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getStatusLabel = (status: InterviewHistoryItem['status']) => {
    switch (status) {
      case 'completed':
        return t('practice.history.status.completed');
      case 'in-progress':
        return t('practice.history.status.inProgress');
      case 'pending':
        return t('practice.history.status.pending');
      default:
        return status;
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pine"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F1F5F9] flex">
      <div className="flex-1 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              {t('profile.interviewHistory')}
            </h1>
            <p className="text-slate-600 mt-2">
              {t('practice.history.subtitle')}
            </p>
          </div>

          <div className="grid gap-6">
            {interviews.length > 0 ? (
              interviews.map((interview) => (
                <div
                  key={interview.id}
                  onClick={() => handleInterviewClick(interview.id)}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-pine transition-colors">
                        {interview.jobTitle}
                      </h3>
                      <p className="text-slate-500 text-sm">{interview.company}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[interview.status]}`}>
                      {getStatusLabel(interview.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400 text-xs uppercase tracking-wide block">
                        {t('practice.history.date')}
                      </span>
                      <span className="text-slate-700 font-medium">
                        {formatDate(interview.date)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs uppercase tracking-wide block">
                        {t('practice.history.duration')}
                      </span>
                      <span className="text-slate-700 font-medium">
                        {formatDuration(interview.duration)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs uppercase tracking-wide block">
                        {t('practice.history.score')}
                      </span>
                      <span className={`font-medium ${interview.overallScore > 0 ? 'text-green-600' : 'text-slate-500'}`}>
                        {interview.overallScore > 0 ? `${interview.overallScore}%` : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-start md:justify-end">
                      <span className="text-pine text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform">
                        {t('practice.history.viewDetails')}
                        <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  {t('practice.history.emptyTitle')}
                </h3>
                <p className="text-slate-500">
                  {t('practice.history.emptyDesc')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
