import { useState } from 'react';
import {
  Activity,
  Ban,
  Building2,
  CalendarDays,
  RefreshCw,
  UserPlus,
  Users,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiStatusCode } from '@/shared/api/apiError';
import { useLanguage } from '@/shared/languages';
import { AdminAnalyticsChart } from '../components/analytics/AdminAnalyticsChart';
import { AdminRevenueMetrics } from '../components/analytics/AdminRevenueMetrics';
import { AdminRoleDistribution } from '../components/analytics/AdminRoleDistribution';
import { AdminMetricCard } from '../components/AdminMetricCard';
import { AdminPageShell } from '../components/AdminPageShell';
import { AdminStatusBadge } from '../components/AdminStatusBadge';
import { useAdminAnalytics } from '../hooks/useAdminAnalytics';
import { useAdminPlatform } from '../hooks/useAdminPlatform';
import type { AdminAnalyticsGranularity } from '../types/adminAnalytics.types';

export function AdminDashboardPage() {
  const { t, language } = useLanguage();
  const [groupBy, setGroupBy] = useState<AdminAnalyticsGranularity>('day');
  const [revenueGroupBy, setRevenueGroupBy] = useState<AdminAnalyticsGranularity>('day');
  const analytics = useAdminAnalytics({ groupBy });
  const { snapshot, isLoading: isSnapshotLoading } = useAdminPlatform();
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
    { key: 'totalUsers', label: 'admin.analytics.totalUsers', value: analytics.data.totals.totalUsers, hint: 'admin.analytics.totalUsersHint', status: 'healthy' as const, icon: Users },
    { key: 'newUsers', label: 'admin.analytics.newUsers', value: analytics.data.totals.newUsers, hint: 'admin.analytics.windowHint', status: 'healthy' as const, icon: UserPlus },
    { key: 'bannedUsers', label: 'admin.analytics.bannedUsers', value: analytics.data.totals.bannedUsers, hint: 'admin.analytics.bannedUsersHint', status: analytics.data.totals.bannedUsers > 0 ? 'warning' as const : 'healthy' as const, icon: Ban },
    { key: 'organizations', label: 'admin.analytics.organizations', value: analytics.data.totals.totalOrganizations, hint: 'admin.analytics.organizationsHint', status: 'healthy' as const, icon: Building2 },
    { key: 'active7', label: 'admin.analytics.active7Days', value: analytics.data.activeUsers.last7Days, hint: 'admin.analytics.activeHint', status: 'healthy' as const, icon: Activity },
    { key: 'active30', label: 'admin.analytics.active30Days', value: analytics.data.activeUsers.last30Days, hint: 'admin.analytics.activeHint', status: 'healthy' as const, icon: CalendarDays },
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
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <AdminMetricCard
                  key={metric.key}
                  label={t(metric.label)}
                  value={metric.value}
                  hint={t(metric.hint)}
                  status={metric.status}
                  icon={<Icon className="h-5 w-5" aria-hidden />}
                />
              );
            })}
          </section>
          <section className="grid gap-6 lg:grid-cols-3">
            <AdminAnalyticsChart buckets={analytics.data.buckets} />
            <AdminRoleDistribution items={analytics.data.totals.byRole} />
          </section>
        </>
      ) : null}

      {isSnapshotLoading || !snapshot ? (
        <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
      ) : (
        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="frame-satin bg-surface-raised">
            <CardHeader><CardTitle>{t('admin.dashboard.health')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {snapshot.health.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-satin bg-surface-overlay p-3">
                  <div>
                    <p className="font-medium text-foreground">{t(item.nameKey)}</p>
                    <p className="text-xs text-muted-foreground">{item.latencyMs}ms</p>
                  </div>
                  <AdminStatusBadge status={item.status} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="frame-satin bg-surface-raised">
            <CardHeader><CardTitle>{t('admin.dashboard.audit')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {snapshot.auditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="rounded-lg border border-satin bg-surface-overlay p-3">
                  <p className="font-medium text-foreground">{t(log.actionKey)}</p>
                  <p className="text-xs text-muted-foreground">{log.actor} · {log.hash}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </AdminPageShell>
  );
}
