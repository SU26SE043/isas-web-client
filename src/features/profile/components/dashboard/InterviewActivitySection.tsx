import React, { useMemo } from 'react';
import { useInterviewHistory } from '@/features/practice/hooks/useInterviewHistory';
import { useLanguage } from '@/shared/languages';
import { computeInterviewActivityStats } from '../../utils/interviewHeatmapUtils';
import { InterviewActivityEmptyState } from './InterviewActivityEmptyState';
import { InterviewHeatmapGrid } from './InterviewHeatmapGrid';

const CURRENT_YEAR = new Date().getFullYear();

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-right">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground sm:text-xs">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground sm:text-base">{value}</p>
    </div>
  );
}

export const InterviewActivitySection: React.FC = () => {
  const { t } = useLanguage();
  const { interviews, isLoading } = useInterviewHistory();

  const yearInterviews = useMemo(
    () => interviews.filter((item) => item.date.startsWith(String(CURRENT_YEAR))),
    [interviews],
  );
  const stats = useMemo(() => computeInterviewActivityStats(yearInterviews), [yearInterviews]);
  const hasActivity = yearInterviews.length > 0;

  return (
    <section className="rounded-2xl border border-subtle bg-surface-elevated p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            {t('profile.dashboard.heatmapTitle')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('profile.dashboard.heatmapSubtitle')}</p>
        </div>

        {hasActivity ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
            <StatItem label={t('profile.dashboard.heatmapTotal')} value={stats.total} />
            <StatItem
              label={t('profile.dashboard.heatmapAverageScore')}
              value={`${stats.averageScore}%`}
            />
            <StatItem label={t('profile.dashboard.heatmapPassed')} value={stats.passed} />
            <StatItem label={t('profile.dashboard.heatmapFailed')} value={stats.failed} />
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-xl bg-surface-overlay" aria-busy="true" />
        ) : hasActivity ? (
          <InterviewHeatmapGrid interviews={yearInterviews} year={CURRENT_YEAR} />
        ) : (
          <InterviewActivityEmptyState />
        )}
      </div>
    </section>
  );
};
