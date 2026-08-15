import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import { AnalyticsBars } from '../components/AnalyticsBars';
import { useEmployerAnalytics } from '../hooks/useEmployerAnalytics';
import type { AnalyticsFilters, ExportFormat, PipelineStatus } from '../types/employerAnalytics.types';

const statuses: Array<PipelineStatus | 'all'> = [
  'all',
  'invited',
  'invite_pending',
  'in_progress',
  'paused_violation',
  'auto_submitted',
  'completed',
];

export function EmployerAnalyticsPage() {
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<AnalyticsFilters>({ dateRange: '30d', status: 'all' });
  const stableFilters = useMemo(() => filters, [filters]);
  const { analytics, isLoading, exportAnalytics } = useEmployerAnalytics(searchParams.get('campaignId') ?? undefined, stableFilters);

  const runExport = async (format: ExportFormat, rows?: number) => {
    const result = await exportAnalytics(format, rows ?? analytics?.exportableRows ?? 0);
    setMessage(t(result.messageKey));
  };

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-label text-muted-foreground">{t('employerAnalytics.analytics.eyebrow')}</p>
            <h1 className="heading-primary text-3xl text-foreground">{t('employerAnalytics.analytics.title')}</h1>
            <p className="body-text max-w-3xl text-sm text-muted-foreground">{t('employerAnalytics.analytics.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => runExport('csv')}><Download className="size-4" aria-hidden /> {t('employerAnalytics.analytics.exportCsv')}</Button>
            <Button onClick={() => runExport('pdf')}><Download className="size-4" aria-hidden /> {t('employerAnalytics.analytics.exportPdf')}</Button>
          </div>
        </header>

        {message ? <Alert variant="info"><AlertDescription>{message}</AlertDescription></Alert> : null}
        <div className="grid gap-3 rounded-xl border border-subtle bg-surface-raised p-4 md:grid-cols-2">
          <Select label={t('employerAnalytics.analytics.dateRange')} value={filters.dateRange} onChange={(dateRange) => setFilters({ ...filters, dateRange: dateRange as AnalyticsFilters['dateRange'] })}>
            {(['30d', '90d', 'ytd'] as const).map((range) => <option key={range} value={range}>{t(`employerAnalytics.analytics.dateRange.${range}`)}</option>)}
          </Select>
          <Select label={t('employerAnalytics.pipeline.status')} value={filters.status} onChange={(status) => setFilters({ ...filters, status: status as AnalyticsFilters['status'] })}>
            {statuses.map((status) => <option key={status} value={status}>{t(`employerAnalytics.status.${status}`)}</option>)}
          </Select>
        </div>

        {isLoading || !analytics ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Metric label={t('employerAnalytics.analytics.totalCandidates')} value={analytics.totalCandidates} hint={`${analytics.exportableRows} ${t('employerAnalytics.analytics.rows')}`} />
              <Metric label={t('employerAnalytics.analytics.completionRate')} value={`${analytics.completionRate}%`} hint={t('employerAnalytics.analytics.weeklyTrend')} />
              <Metric label={t('employerAnalytics.analytics.averageScore')} value={analytics.averageScore} hint={t('employerAnalytics.analytics.scoreDistribution')} />
              <Metric label={t('employerAnalytics.analytics.timeToHire')} value={analytics.timeToHireDays} hint={t('employerAnalytics.analytics.dateRange.30d')} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <AnalyticsBars title={t('employerAnalytics.analytics.funnel')} items={analytics.funnel.map((item) => ({ label: t(`employerAnalytics.status.${item.status}`), value: item.count }))} />
              <AnalyticsBars title={t('employerAnalytics.analytics.scoreDistribution')} items={analytics.scoreDistribution.map((item) => ({ label: item.band, value: item.count }))} />
              <AnalyticsBars title={t('employerAnalytics.analytics.topSkills')} items={analytics.topSkills.map((item) => ({ label: item.skill, value: item.demand, hint: '%' }))} max={100} />
              <AnalyticsBars title={t('employerAnalytics.analytics.weeklyTrend')} items={analytics.weeklyTrend.map((item) => ({ label: item.week, value: item.completed }))} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      {label}
      <select className="h-10 rounded-lg border border-input bg-surface-overlay px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function Metric({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
