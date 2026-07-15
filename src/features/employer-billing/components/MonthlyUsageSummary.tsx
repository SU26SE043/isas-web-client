import { useLanguage } from '@/shared/languages';
import type { MonthlyUsagePeriod } from '../types/employerBilling.types';

interface MonthlyUsageSummaryProps {
  periods: MonthlyUsagePeriod[];
}

export function MonthlyUsageSummary({ periods }: MonthlyUsageSummaryProps) {
  const { t, language } = useLanguage();

  if (periods.length === 0) {
    return (
      <div className="rounded-xl border border-subtle bg-surface-overlay px-4 py-8 text-center">
        <p className="text-sm font-medium text-foreground">{t('employerBilling.usage.emptyTitle')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('employerBilling.usage.emptyDescription')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {periods.map((period) => (
        <article
          key={period.monthKey}
          className="rounded-xl border border-subtle bg-surface-overlay p-4"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {language === 'vi' ? period.labelVi : period.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{period.totalTokens.toLocaleString()}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('employerBilling.usage.tokensLabel')}</p>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{t('employerBilling.usage.sessions')}</dt>
              <dd className="font-medium text-foreground">{period.sessionCount}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{t('employerBilling.usage.periodStatus')}</dt>
              <dd className="font-medium text-foreground">{t(`employerBilling.usage.status.${period.status}`)}</dd>
            </div>
            {period.invoiceNumber ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{t('employerBilling.usage.invoice')}</dt>
                <dd className="font-medium text-foreground">{period.invoiceNumber}</dd>
              </div>
            ) : null}
          </dl>
        </article>
      ))}
    </div>
  );
}
