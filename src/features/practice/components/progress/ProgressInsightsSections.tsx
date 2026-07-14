import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import type {
  ProgressAchievementPreview,
  ProgressAiInsight,
  ProgressComparativePeriod,
  ProgressExportKind,
  ProgressRecommendation,
  ProgressSessionAnalytics,
} from '../../types/progress.types';
import { ProgressSection, ProgressStat } from './ProgressSection';

export function ProgressAchievementsPreview({ items }: { items: ProgressAchievementPreview[] }) {
  const { t, language } = useLanguage();
  return (
    <ProgressSection
      title={t('practice.progress.sections.achievements')}
      action={
        <Link to="/candidate/achievements" className="btn-secondary text-xs">
          {t('practice.progress.cta.allAchievements')}
        </Link>
      }
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.id}
            className={`rounded-lg px-4 py-3 text-sm ${item.earned ? 'bg-surface-overlay' : 'border border-dashed border-subtle opacity-60'}`}
          >
            <p className="font-medium text-foreground">{language === 'vi' ? item.titleVi : item.title}</p>
            <p className="text-caption text-muted-foreground">
              {item.earned
                ? t('practice.progress.achievements.earned')
                : t('practice.progress.achievements.locked')}
            </p>
          </li>
        ))}
      </ul>
    </ProgressSection>
  );
}

export function ProgressAiInsights({ items }: { items: ProgressAiInsight[] }) {
  const { t, language } = useLanguage();
  return (
    <ProgressSection title={t('practice.progress.sections.insights')}>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg bg-surface-overlay px-4 py-3">
            <p className="font-medium text-foreground">{language === 'vi' ? item.titleVi : item.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {language === 'vi' ? item.bodyVi : item.body}
            </p>
          </li>
        ))}
      </ul>
    </ProgressSection>
  );
}

export function ProgressRecommendations({ items }: { items: ProgressRecommendation[] }) {
  const { t, language } = useLanguage();
  return (
    <ProgressSection title={t('practice.progress.sections.recommendations')}>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-subtle bg-surface-overlay px-4 py-3"
          >
            <div>
              <p className="font-medium text-foreground">{language === 'vi' ? item.titleVi : item.title}</p>
              <p className="text-sm text-muted-foreground">
                {language === 'vi' ? item.reasonVi : item.reason}
              </p>
            </div>
            <Link to={item.practiceHref} className="btn-primary inline-flex text-xs">
              {t('practice.progress.cta.practiceNow')}
            </Link>
          </li>
        ))}
      </ul>
    </ProgressSection>
  );
}

export function ProgressComparativeStats({ items }: { items: ProgressComparativePeriod[] }) {
  const { t, language } = useLanguage();
  return (
    <ProgressSection title={t('practice.progress.sections.comparative')}>
      <div className="grid gap-3 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-lg bg-surface-overlay p-4">
            <p className="font-medium text-foreground">{language === 'vi' ? item.labelVi : item.label}</p>
            <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
              <div>
                {t('practice.progress.comparative.improvement')}: +{item.improvementPercent}%
              </div>
              <div>
                {t('practice.progress.comparative.frequency')}: {item.practiceFrequency}
              </div>
              <div>
                {t('practice.progress.comparative.avgScore')}: {item.averageScore}
              </div>
              <div>
                {t('practice.progress.comparative.hours')}: {item.learningHours}
              </div>
            </dl>
          </article>
        ))}
      </div>
    </ProgressSection>
  );
}

export function ProgressSessionAnalytics({ data }: { data: ProgressSessionAnalytics }) {
  const { t } = useLanguage();
  const stats = [
    { label: t('practice.progress.session.duration'), value: data.averageSessionDurationMinutes },
    { label: t('practice.progress.session.avgScore'), value: data.averageScore },
    { label: t('practice.progress.session.questions'), value: data.averageAiQuestions },
    { label: t('practice.progress.session.responseTime'), value: data.averageResponseTimeSeconds },
    { label: t('practice.progress.session.retries'), value: data.averageRetryCount },
    { label: t('practice.progress.session.confidence'), value: data.averageConfidence },
    { label: t('practice.progress.session.speakingSpeed'), value: data.averageSpeakingSpeedWpm },
    { label: t('practice.progress.session.thinkingTime'), value: data.averageThinkingTimeSeconds },
  ];
  return (
    <ProgressSection title={t('practice.progress.sections.sessionAnalytics')}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <ProgressStat key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
    </ProgressSection>
  );
}

const EXPORT_KINDS: ProgressExportKind[] = ['progress', 'readiness', 'learning', 'skill', 'portfolio'];

export function ProgressExportPanel({
  exporting,
  onExport,
  message,
}: {
  exporting: ProgressExportKind | null;
  onExport: (kind: ProgressExportKind) => void;
  message?: string | null;
}) {
  const { t } = useLanguage();
  return (
    <ProgressSection
      title={t('practice.progress.sections.export')}
      description={t('practice.progress.sections.exportDesc')}
    >
      <div className="flex flex-wrap gap-2">
        {EXPORT_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            className="btn-secondary text-xs"
            disabled={exporting !== null}
            onClick={() => onExport(kind)}
          >
            {exporting === kind ? t('practice.progress.export.working') : t(`practice.progress.export.${kind}`)}
          </button>
        ))}
      </div>
      {message ? <p className="mt-3 text-sm text-success">{message}</p> : null}
    </ProgressSection>
  );
}
