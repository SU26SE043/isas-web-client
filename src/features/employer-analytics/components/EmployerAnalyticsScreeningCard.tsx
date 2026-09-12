import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { EmployerAnalytics } from '../types/employerAnalytics.types';
import { AnalyticsCard } from './AnalyticsCard';

/** Chip rủi ro chỉ tô chữ theo mức — khung vẫn monochrome. */
const RISK_CLASS: Record<string, string> = {
  Low: 'border-success/30 bg-success-bg text-success',
  Medium: 'border-warning/30 bg-warning-bg text-warning',
  High: 'border-error/30 bg-error-bg text-error',
};

export function EmployerAnalyticsScreeningCard({ data }: { data: EmployerAnalytics }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const { screening } = data;
  const maxSkill = screening.topSkills.reduce((max, item) => Math.max(max, item.count), 0);

  return (
    <AnalyticsCard
      title={t('employerAnalytics.screening.title')}
      description={t('employerAnalytics.screening.description')}
      contentClassName="space-y-5"
    >
      <dl className="grid grid-cols-3 gap-3">
        <Metric label={t('employerAnalytics.screening.submissions')} value={screening.submissions.toLocaleString(locale)} />
        <Metric label={t('employerAnalytics.screening.analyzed')} value={screening.analyzed.toLocaleString(locale)} />
        <Metric
          label={t('employerAnalytics.screening.medianFit')}
          value={screening.medianFitScore == null ? '—' : screening.medianFitScore.toLocaleString(locale, { maximumFractionDigits: 1 })}
        />
      </dl>

      <section aria-label={t('employerAnalytics.screening.risk')} className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">{t('employerAnalytics.screening.risk')}</p>
        <ul className="flex flex-wrap gap-2">
          {screening.riskBySeverity.map((item) => {
            const labelKey = `employerAnalytics.screening.risk.${item.risk}`;
            const label = t(labelKey);
            return (
              <li
                key={item.risk}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                  RISK_CLASS[item.risk] ?? 'border-satin bg-surface-overlay text-muted-foreground',
                )}
              >
                <span>{label === labelKey ? item.risk : label}</span>
                <span className="tabular-nums">{item.count.toLocaleString(locale)}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label={t('employerAnalytics.screening.topSkills')} className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{t('employerAnalytics.screening.topSkills')}</p>
          <p className="text-xs text-muted-foreground">{t('employerAnalytics.screening.topSkillsHint')}</p>
        </div>
        {screening.topSkills.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('employerAnalytics.screening.topSkillsEmpty')}</p>
        ) : (
          <ol className="space-y-2">
            {screening.topSkills.map((item) => {
              const percentage = maxSkill > 0 ? Math.round((item.count / maxSkill) * 100) : 0;
              return (
                <li key={item.skill} className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium text-foreground">{item.skill}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{item.count.toLocaleString(locale)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-overlay">
                    <div className="h-full rounded-full bg-foreground" style={{ width: `${percentage}%` }} aria-hidden />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </AnalyticsCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-satin bg-surface-overlay p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-foreground">{value}</dd>
    </div>
  );
}
