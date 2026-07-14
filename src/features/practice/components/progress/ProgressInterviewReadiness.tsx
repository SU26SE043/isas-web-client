import { useLanguage } from '@/shared/languages';
import type { ProgressInterviewReadiness } from '../../types/progress.types';
import { ProgressSection } from './ProgressSection';

export function ProgressInterviewReadiness({ data }: { data: ProgressInterviewReadiness }) {
  const { t, language } = useLanguage();

  return (
    <ProgressSection
      title={t('practice.progress.sections.readiness')}
      description={t('practice.progress.sections.readinessDesc')}
    >
      <div className="mb-4 flex flex-wrap items-end gap-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {t('practice.progress.readiness.overall')}
          </p>
          <p className="text-4xl font-semibold tabular-nums text-foreground">{data.overallPercent}%</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {t('practice.progress.readiness.aiConfidence')}
          </p>
          <p className="text-2xl font-semibold tabular-nums text-foreground">{data.aiConfidenceScore}</p>
        </div>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {data.dimensions.map((dim) => (
          <li key={dim.id} className="rounded-lg bg-surface-overlay px-4 py-3">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-foreground">{language === 'vi' ? dim.labelVi : dim.label}</span>
              <span className="tabular-nums text-muted-foreground">{dim.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-base">
              <div className="h-full bg-foreground/70" style={{ width: `${dim.percent}%` }} />
            </div>
          </li>
        ))}
      </ul>
      {data.skillsToImprove.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-foreground">{t('practice.progress.readiness.improve')}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {data.skillsToImprove.map((skill) => (
              <li key={skill.id}>{language === 'vi' ? skill.labelVi : skill.label}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </ProgressSection>
  );
}
