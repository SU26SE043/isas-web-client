import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import { useAdminTraffic } from '../../hooks/useAdminAiUsage';
import { useAdminRevenue } from '../../hooks/useAdminRevenue';
import type { AdminAnalyticsGranularity } from '../../types/adminAnalytics.types';
import type { AdminTrafficAnalytics } from '../../types/adminApi.types';
import { formatDurationMs } from '../../utils/adminFormat';

const TOP_ROUTES = 5;

/** Route nhiều 5xx trước, rồi nhiều request — "cháy" nổi lên đầu bảng thay vì bị route khoẻ nhấn chìm. */
export function rankRoutes(byRoute: AdminTrafficAnalytics['byRoute']): AdminTrafficAnalytics['byRoute'] {
  return [...byRoute].sort((a, b) => b.summary.errors5xx - a.summary.errors5xx || b.summary.requests - a.summary.requests);
}

/**
 * Traffic gateway (FR18) — cùng kỳ với doanh thu (lấy `from/to` từ revenue). Một card gọn: tổng request ·
 * 4xx · 5xx (đỏ khi >0) · thời gian trung bình/max + top route. `routeId` là route YARP của gateway.
 */
export function AdminTrafficMetrics({ groupBy }: { groupBy: AdminAnalyticsGranularity }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const { revenue } = useAdminRevenue(groupBy);
  const range = revenue.data ? { from: revenue.data.from, to: revenue.data.to } : null;
  const traffic = useAdminTraffic(range);
  const totals = traffic.data?.totals;
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const rows = traffic.data ? rankRoutes(traffic.data.byRoute).slice(0, TOP_ROUTES) : [];

  return (
    <Card className="frame-satin bg-surface-raised" aria-labelledby="admin-traffic-title">
      <CardHeader><CardTitle id="admin-traffic-title">{t('admin.traffic.title')}</CardTitle><p className="text-sm text-muted-foreground">{t('admin.traffic.description')}</p></CardHeader>
      <CardContent className="space-y-4">
        {traffic.isLoading || revenue.isLoading ? <Skeleton className="h-32" /> : null}
        {traffic.isError ? <Alert variant="error"><AlertDescription>{t('admin.traffic.errors.load')}</AlertDescription></Alert> : null}
        {totals ? (
          <>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
              <div><dt className="text-muted-foreground">{t('admin.traffic.requests')}</dt><dd className="text-lg font-semibold tabular-nums">{number(totals.requests)}</dd></div>
              <div><dt className="text-muted-foreground">{t('admin.traffic.errors4xx')}</dt><dd className="text-lg font-semibold tabular-nums">{number(totals.errors4xx)}</dd></div>
              <div><dt className="text-muted-foreground">{t('admin.traffic.errors5xx')}</dt><dd className="flex items-center gap-2 text-lg font-semibold tabular-nums">{number(totals.errors5xx)}{totals.errors5xx > 0 ? <Badge variant="warning">{t('admin.traffic.needsAttention')}</Badge> : null}</dd></div>
              <div><dt className="text-muted-foreground">{t('admin.traffic.avgDuration')}</dt><dd className="text-lg font-semibold tabular-nums">{formatDurationMs(totals.avgDurationMs, locale)}</dd></div>
              <div><dt className="text-muted-foreground">{t('admin.traffic.maxDuration')}</dt><dd className="text-lg font-semibold tabular-nums">{formatDurationMs(totals.maxDurationMs, locale)}</dd></div>
            </dl>
            <Table aria-label={t('admin.traffic.topRoutes')}>
              <TableHeader><TableRow><TableHead>{t('admin.traffic.route')}</TableHead><TableHead className="text-right">{t('admin.traffic.requests')}</TableHead><TableHead className="text-right">5xx</TableHead><TableHead className="text-right">{t('admin.traffic.avgDuration')}</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.routeId}><TableCell className="font-mono text-xs">{row.routeId}</TableCell><TableCell className="text-right tabular-nums">{number(row.summary.requests)}</TableCell><TableCell className={`text-right tabular-nums ${row.summary.errors5xx > 0 ? 'text-warning' : ''}`}>{number(row.summary.errors5xx)}</TableCell><TableCell className="text-right tabular-nums">{formatDurationMs(row.summary.avgDurationMs, locale)}</TableCell></TableRow>
                ))}
                {rows.length === 0 ? <TableRow><TableCell colSpan={4} className="text-sm text-muted-foreground">{t('admin.traffic.empty')}</TableCell></TableRow> : null}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground">{t('admin.traffic.routeNote')}</p>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
