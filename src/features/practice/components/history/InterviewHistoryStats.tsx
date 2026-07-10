import React from 'react';
import { useLanguage } from '../../../../shared/languages';

interface InterviewHistoryStatsProps {
  total: number;
  completed: number;
  avgScore: number;
  inProgress: number;
}

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="bg-surface-raised rounded-xl p-4 flex items-center border border-subtle">
    <div className="w-12 h-12 rounded-lg bg-surface-overlay text-muted-foreground flex items-center justify-center mr-4 shadow-sm shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-[11px] md:text-xs text-muted-foreground font-medium mb-0.5">{label}</p>
      <p className="text-xl md:text-2xl font-bold text-foreground leading-none">{value}</p>
    </div>
  </div>
);

export const InterviewHistoryStats: React.FC<InterviewHistoryStatsProps> = ({
  total,
  completed,
  avgScore,
  inProgress,
}) => {
  const { t } = useLanguage();
  const iconClass = 'w-6 h-6';

  return (
    <div className="flex-shrink-0 grid grid-cols-4 gap-4 mb-6">
      <StatCard
        label={t('practice.history.totalInterviews')}
        value={total}
        icon={
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        }
      />
      <StatCard
        label={t('practice.history.completed')}
        value={completed}
        icon={
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        }
      />
      <StatCard
        label={t('practice.history.averageScore')}
        value={`${avgScore}%`}
        icon={
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        }
      />
      <StatCard
        label={t('practice.history.inProgress')}
        value={inProgress}
        icon={
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
    </div>
  );
};
