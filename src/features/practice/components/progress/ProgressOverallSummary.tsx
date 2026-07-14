import { useLanguage } from '@/shared/languages';
import type { ProgressOverallSummary } from '../../types/progress.types';
import { ProgressSection, ProgressStat } from './ProgressSection';

export function ProgressOverallSummary({ data }: { data: ProgressOverallSummary }) {
  const { t, language } = useLanguage();
  const last = new Date(data.lastPracticeDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US');

  const items = [
    { label: t('practice.progress.overall.skillScore'), value: data.overallSkillScore },
    { label: t('practice.progress.overall.readiness'), value: `${data.interviewReadinessPercent}%` },
    { label: t('practice.progress.overall.practiceSessions'), value: data.totalPracticeSessions },
    { label: t('practice.progress.overall.mockInterviews'), value: data.totalMockInterviews },
    { label: t('practice.progress.overall.learningHours'), value: data.totalLearningHours },
    { label: t('practice.progress.overall.completedRoadmaps'), value: data.completedRoadmaps },
    { label: t('practice.progress.overall.activeRoadmaps'), value: data.activeRoadmaps },
    { label: t('practice.progress.overall.domains'), value: data.totalDomains },
    { label: t('practice.progress.overall.currentStreak'), value: data.currentStreak },
    { label: t('practice.progress.overall.longestStreak'), value: data.longestStreak },
    { label: t('practice.progress.overall.avgScore'), value: data.averageSessionScore },
    { label: t('practice.progress.overall.highestScore'), value: data.highestScore },
    { label: t('practice.progress.overall.lastPractice'), value: last },
  ];

  return (
    <ProgressSection title={t('practice.progress.sections.overall')} description={t('practice.progress.sections.overallDesc')}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <ProgressStat key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </ProgressSection>
  );
}
