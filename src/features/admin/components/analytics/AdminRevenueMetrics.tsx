import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiStatusCode } from '@/shared/api/apiError';
import { useLanguage } from '@/shared/languages';
import { CHART_CATEGORICAL, CHART_GRID, CHART_TOOLTIP_STYLE } from '@/shared/charts/chartColors';
import { useAdminRevenue } from '../../hooks/useAdminRevenue';
import type { AdminAnalyticsGranularity } from '../../types/adminAnalytics.types';

const money = (value: number, locale: string) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
const compactAmount = (value: number) => {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(absolute >= 10_000_000_000 ? 0 : 1)}B`;
  if (absolute >= 1_000_000) return `${(value / 1_000_000).toFixed(absolute >= 10_000_000 ? 0 : 1)}M`;
  if (absolute >= 1_000) return `${(value / 1_000).toFixed(absolute >= 10_000 ? 0 : 1)}K`;
  return String(Math.round(value));
};

export function AdminRevenueMetrics({ groupBy }: { groupBy: AdminAnalyticsGranularity }) {
  const { t, language } = useLanguage();
  const { revenue, snapshot } = useAdminRevenue(groupBy);
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const status = getApiStatusCode(revenue.error);
  const errorKey = status === 401 ? 'admin.finance.errors.unauthorized' : status === 403 ? 'admin.finance.errors.forbidden' : 'admin.finance.errors.load';
  const data = revenue.data?.buckets.map((bucket) => ({ ...bucket, label: new Intl.DateTimeFormat(locale, { month: groupBy === 'month' ? 'short' : 'short', day: groupBy === 'day' ? 'numeric' : undefined, year: groupBy === 'month' ? 'numeric' : undefined }).format(new Date(bucket.periodStart)) })) ?? [];
  const maxRevenue = Math.max(...data.map((bucket) => bucket.amountVnd), 0);
  const yAxisMax = maxRevenue > 0 ? maxRevenue : 1;
  const metrics = revenue.data ? [
    [t('admin.finance.netRevenue'), money(revenue.data.netRevenueVnd, locale)],
    [t('admin.finance.grossMargin'), money(revenue.data.grossMarginVnd, locale)],
    [t('admin.finance.arpu'), money(revenue.data.arpuVnd, locale)],
    [t('admin.finance.refundRate'), `${revenue.data.refundRatePct.toFixed(2)}%`],
  ] : [];

  return (
    <section className="space-y-4" aria-labelledby="admin-finance-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 id="admin-finance-title" className="text-xl font-semibold text-foreground">{t('admin.finance.title')}</h2><p className="text-sm text-muted-foreground">{t('admin.finance.description')}</p></div>
        <div className="text-right text-xs text-muted-foreground"><span>{t('admin.finance.flowNote')}</span>{revenue.data ? <p>{t('admin.finance.range').replace('{from}', new Date(revenue.data.from).toLocaleDateString(locale)).replace('{to}', new Date(revenue.data.to).toLocaleDateString(locale))}</p> : null}</div>
      </div>
      {revenue.isLoading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div> : null}
      {revenue.isError ? <div className="space-y-3"><Alert variant="error"><AlertDescription>{t(errorKey)}</AlertDescription></Alert><Button variant="outline" onClick={() => void revenue.refetch()}>{t('admin.finance.retry')}</Button></div> : null}
      {revenue.data ? <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value]) => <Card key={label} className="frame-satin bg-surface-raised"><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-xl font-semibold text-foreground">{value}</p></CardContent></Card>)}</div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="frame-satin bg-surface-raised lg:col-span-2"><CardHeader><CardTitle>{t('admin.finance.chartTitle')}</CardTitle></CardHeader><CardContent><div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}><CartesianGrid stroke={CHART_GRID.stroke} vertical={false} /><XAxis dataKey="label" tick={{ fill: CHART_GRID.axis, fontSize: 11 }} /><YAxis domain={[0, yAxisMax]} allowDecimals={false} tick={{ fill: CHART_GRID.axis, fontSize: 11 }} tickFormatter={(value) => compactAmount(Number(value))} /><Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value: unknown) => [money(typeof value === 'number' ? value : Number(value ?? 0), locale), t('admin.finance.netRevenue')]} /><Bar dataKey="amountVnd" name={t('admin.finance.netRevenue')} fill={CHART_CATEGORICAL[0]} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></CardContent></Card>
          <Card className="frame-satin bg-surface-raised"><CardHeader><CardTitle>{t('admin.finance.snapshotTitle')}</CardTitle></CardHeader><CardContent>{snapshot.isLoading ? <Skeleton className="h-40" /> : snapshot.data ? <div className="space-y-4 text-sm"><div><p className="text-muted-foreground">{t('admin.finance.mrr')}</p><p className="text-xl font-semibold">{money(snapshot.data.mrrVnd, locale)}</p></div><div><p className="text-muted-foreground">{t('admin.finance.receivables')}</p><p className="text-xl font-semibold">{money(snapshot.data.outstandingReceivables.totalVnd, locale)}</p></div><div><p className="text-muted-foreground">{t('admin.finance.activeSubscriptions')}</p><p className="text-xl font-semibold">{snapshot.data.activeSubscriptionCount}</p></div></div> : <p className="text-sm text-muted-foreground">{t('admin.finance.snapshotUnavailable')}</p>}</CardContent></Card>
        </div>
      </> : null}
    </section>
  );
}
