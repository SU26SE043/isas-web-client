import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import type {
  ProgressGoal,
  ProgressHeatmapDay,
  ProgressImprovementItem,
  ProgressRoadmapItem,
  ProgressTimelineItem,
} from '../../types/progress.types';
import { ProgressSection } from './ProgressSection';

export function ProgressImprovementTrend({ items }: { items: ProgressImprovementItem[] }) {
  const { t, language } = useLanguage();
  return (
    <ProgressSection title={t('practice.progress.sections.improvement')}>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg bg-surface-overlay px-4 py-3">
            <p className="font-medium text-foreground">{language === 'vi' ? item.nameVi : item.name}</p>
            <p
              className={`mt-1 text-2xl font-semibold tabular-nums ${item.deltaPercent < 0 ? 'text-error' : 'text-success'}`}
            >
              {item.deltaPercent >= 0 ? '+' : ''}
              {item.deltaPercent}%
            </p>
            <p className="text-caption text-muted-foreground">{t(`practice.progress.trend.${item.trend}`)}</p>
          </li>
        ))}
      </ul>
    </ProgressSection>
  );
}

export function ProgressPracticeTimeline({ items }: { items: ProgressTimelineItem[] }) {
  const { t, language } = useLanguage();
  return (
    <ProgressSection title={t('practice.progress.sections.timeline')}>
      <ol className="space-y-3">
        {items.map((item) => {
          const content = (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-subtle bg-surface-overlay px-4 py-3">
              <div>
                <p className="text-caption text-muted-foreground">
                  {language === 'vi' ? item.relativeLabelVi : item.relativeLabel}
                </p>
                <p className="font-medium text-foreground">{language === 'vi' ? item.titleVi : item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' ? item.domainVi : item.domain}
                </p>
              </div>
              <p className="text-xl font-semibold tabular-nums text-foreground">{item.score}%</p>
            </div>
          );
          return (
            <li key={item.id}>
              {item.reportId ? (
                <Link to={`/candidate/practice/history/${item.reportId}`} className="block transition hover:opacity-90">
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ol>
    </ProgressSection>
  );
}

const HEAT_CLASSES = [
  'bg-surface-base',
  'bg-foreground/15',
  'bg-foreground/30',
  'bg-foreground/50',
  'bg-foreground/75',
];

export function ProgressLearningHeatmap({ days }: { days: ProgressHeatmapDay[] }) {
  const { t } = useLanguage();
  return (
    <ProgressSection
      title={t('practice.progress.sections.heatmap')}
      description={t('practice.progress.sections.heatmapDesc')}
    >
      <div
        className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-2"
        style={{ gridAutoColumns: '12px' }}
      >
        {days.map((day) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.sessions} sessions, ${day.hours}h`}
            className={`size-3 rounded-sm ${HEAT_CLASSES[day.intensity]}`}
          />
        ))}
      </div>
      <p className="mt-3 text-caption text-muted-foreground">{t('practice.progress.heatmap.legend')}</p>
    </ProgressSection>
  );
}

export function ProgressGoalTracking({
  goals,
  onCreateStub,
}: {
  goals: ProgressGoal[];
  onCreateStub: () => void;
}) {
  const { t, language } = useLanguage();
  return (
    <ProgressSection
      title={t('practice.progress.sections.goals')}
      action={
        <button type="button" className="btn-secondary text-xs" onClick={onCreateStub}>
          {t('practice.progress.goals.create')}
        </button>
      }
    >
      <ul className="space-y-3">
        {goals.map((goal) => (
          <li key={goal.id} className="rounded-lg bg-surface-overlay px-4 py-3">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-medium text-foreground">{language === 'vi' ? goal.domainVi : goal.domain}</p>
              <p className="text-sm text-muted-foreground">
                {goal.currentPercent}% / {goal.targetPercent}%
              </p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-base">
              <div
                className="h-full bg-foreground/70"
                style={{ width: `${Math.min(100, (goal.currentPercent / goal.targetPercent) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-caption text-muted-foreground">
              {t('practice.progress.goals.remaining')
                .replace('{remaining}', String(goal.remainingPercent))
                .replace('{sessions}', String(goal.estimatedSessionsRemaining))}
            </p>
          </li>
        ))}
      </ul>
    </ProgressSection>
  );
}

export function ProgressRoadmapProgress({ items }: { items: ProgressRoadmapItem[] }) {
  const { t, language } = useLanguage();
  return (
    <ProgressSection title={t('practice.progress.sections.roadmaps')}>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border border-subtle bg-surface-overlay px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-foreground">{language === 'vi' ? item.nameVi : item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t('practice.progress.roadmap.milestone')}:{' '}
                  {language === 'vi' ? item.currentMilestoneVi : item.currentMilestone}
                </p>
              </div>
              <Link to={`/candidate/learning/roadmaps/${item.id}`} className="btn-ghost text-xs">
                {t('practice.progress.cta.viewRoadmap')}
              </Link>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.completionPercent}% ·{' '}
              {t('practice.progress.roadmap.modules')
                .replace('{done}', String(item.completedModules))
                .replace('{left}', String(item.remainingModules))}{' '}
              · {t('practice.progress.roadmap.eta')}: {item.estimatedFinishDate}
            </p>
          </li>
        ))}
      </ul>
    </ProgressSection>
  );
}
