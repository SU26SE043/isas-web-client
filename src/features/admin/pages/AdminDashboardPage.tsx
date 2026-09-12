import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiStatusCode } from '@/shared/api/apiError';
import { useLanguage } from '@/shared/languages';
import { AdminAnalyticsChart } from '../components/analytics/AdminAnalyticsChart';
import { AdminRevenueMetrics } from '../components/analytics/AdminRevenueMetrics';
import { AdminRoleDistribution } from '../components/analytics/AdminRoleDistribution';
import { StatCard, StatGrid } from '@/components/patterns/StatCard';
import { AdminPageShell } from '../components/AdminPageShell';
import { AdminStatusBadge } from '../components/AdminStatusBadge';
import { useAdminAnalytics } from '../hooks/useAdminAnalytics';
import type { AdminAnalyticsGranularity } from '../types/adminAnalytics.types';

export function AdminDashboardPage() {
  const { t, language } = useLanguage();
  const [groupBy, setGroupBy] = useState<AdminAnalyticsGranularity>('day');
  const [revenueGroupBy, setRevenueGroupBy] = useState<AdminAnalyticsGranularity>('day');
  const analytics = useAdminAnalytics({ groupBy });
  const status = getApiStatusCode(analytics.error);
  const errorKey = status === 400
    ? 'admin.analytics.errors.invalidRange'
    : status === 401
      ? 'admin.analytics.errors.unauthorized'
      : status === 403
        ? 'admin.analytics.errors.forbidden'
        : 'admin.analytics.errors.load';
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));

  const metrics = analytics.data ? [
    { key: 'totalUsers', label: 'admin.analytics.totalUsers', value: analytics.data.totals.totalUsers, hint: 'admin.analytics.totalUsersHint', status: 'healthy' as const },
    { key: 'newUsers', label: 'admin.analytics.newUsers', value: analytics.data.totals.newUsers, hint: 'admin.analytics.windowHint', status: 'healthy' as const },
    { key: 'bannedUsers', label: 'admin.analytics.bannedUsers', value: analytics.data.totals.bannedUsers, hint: 'admin.analytics.bannedUsersHint', status: analytics.data.totals.bannedUsers > 0 ? 'warning' as const : 'healthy' as const },
    { key: 'organizations', label: 'admin.analytics.organizations', value: analytics.data.totals.totalOrganizations, hint: 'admin.analytics.organizationsHint', status: 'healthy' as const },
    { key: 'active7', label: 'admin.analytics.active7Days', value: analytics.data.activeUsers.last7Days, hint: 'admin.analytics.activeHint', status: 'healthy' as const },
    { key: 'active30', label: 'admin.analytics.active30Days', value: analytics.data.activeUsers.last30Days, hint: 'admin.analytics.activeHint', status: 'healthy' as const },
  ] : [];

  return (
    <AdminPageShell
      title={t('admin.dashboard.title')}
      description={t('admin.dashboard.description')}
      actions={(
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="admin-analytics-granularity">
            {t('admin.analytics.groupBy')}
          </label>
          <select
            id="admin-analytics-granularity"
            value={groupBy}
            className="h-8 rounded-lg border border-satin bg-surface-overlay px-3 text-sm"
            onChange={(event) => setGroupBy(event.target.value as AdminAnalyticsGranularity)}
          >
            <option value="day">{t('admin.analytics.day')}</option>
            <option value="month">{t('admin.analytics.month')}</option>
          </select>
          <Button variant="outline" loading={analytics.isFetching} onClick={() => void analytics.refetch()}>
            <RefreshCw aria-hidden />
            {t('admin.analytics.refresh')}
          </Button>
          <label className="sr-only" htmlFor="admin-revenue-granularity">{t('admin.finance.groupBy')}</label>
          <select id="admin-revenue-granularity" value={revenueGroupBy} className="h-8 rounded-lg border border-satin bg-surface-overlay px-3 text-sm" onChange={(event) => setRevenueGroupBy(event.target.value as AdminAnalyticsGranularity)}>
            <option value="day">{t('admin.finance.day')}</option>
            <option value="month">{t('admin.finance.month')}</option>
          </select>
        </div>
      )}
    >
      {analytics.data ? (
        <p className="text-sm text-muted-foreground">
          {t('admin.analytics.range')
            .replace('{from}', formatDate(analytics.data.from))
            .replace('{to}', formatDate(analytics.data.to))}
        </p>
      ) : null}

      <AdminRevenueMetrics groupBy={revenueGroupBy} />

      {analytics.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-40" />)}
        </div>
      ) : null}
      {analytics.isError ? (
        <div className="space-y-3">
          <Alert variant="error"><AlertDescription>{t(errorKey)}</AlertDescription></Alert>
          {status !== 401 && status !== 403 ? (
            <Button variant="outline" onClick={() => void analytics.refetch()}>
              {t('admin.directory.retry')}
            </Button>
          ) : null}
        </div>
      ) : null}
      {analytics.data ? (
        <>
          <StatGrid columns={3}>
            {metrics.map((metric) => (
              <StatCard
                key={metric.key}
                label={t(metric.label)}
                value={metric.value}
                hint={t(metric.hint)}
                aside={<AdminStatusBadge status={metric.status} />}
              />
            ))}
          </StatGrid>
          <section className="grid gap-6 lg:grid-cols-3">
            <AdminAnalyticsChart buckets={analytics.data.buckets} />
            <AdminRoleDistribution items={analytics.data.totals.byRole} />
          </section>
        </>
      ) : null}

    </AdminPageShell>
  );
}
