import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard, StatGrid, StatGridSkeleton } from '@/components/patterns/StatCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getApiStatusCode } from '@/shared/api/apiError';
import { useLanguage } from '@/shared/languages';
import { CHART_CATEGORICAL, CHART_GRID, CHART_TOOLTIP_STYLE } from '@/shared/charts/chartColors';
import { useAdminAiUsage } from '../../hooks/useAdminAiUsage';
import { useAdminRevenue } from '../../hooks/useAdminRevenue';
import type { AdminAnalyticsGranularity } from '../../types/adminAnalytics.types';
import { formatVnd } from '../../utils/adminBilling';
import { formatAudioMinutes, formatPeriodLabel, formatTokens, formatUsd } from '../../utils/adminFormat';

const TOP_OPERATIONS = 6;

/**
 * Chi phí AI (F22) đứng NGAY DƯỚI doanh thu, cùng một kỳ: kỳ lấy từ `revenue.data.from/to` (dependent
 * query), tiền VND lấy từ `revenue.aiCostVnd` (đã quy đổi phía BE), còn USD + "tiền đi đâu" từ `ai-usage`.
 * Trước đợt D: `getAiUsage` có service nhưng 0 màn nào gọi ⇒ không ai thấy đang đốt bao nhiêu token/ngày.
 */
export function AdminAiCostMetrics({ groupBy }: { groupBy: AdminAnalyticsGranularity }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const { revenue } = useAdminRevenue(groupBy);
  const range = revenue.data ? { from: revenue.data.from, to: revenue.data.to } : null;
  const usage = useAdminAiUsage(range, groupBy);
  const status = getApiStatusCode(usage.error);
  const errorKey = status === 401 ? 'admin.finance.errors.unauthorized' : status === 403 ? 'admin.finance.errors.forbidden' : 'admin.aiCost.errors.load';
  const data = usage.data?.buckets.map((bucket) => ({ ...bucket, label: formatPeriodLabel(bucket.periodStart, groupBy, locale) })) ?? [];
  const yMax = Math.max(...data.map((bucket) => bucket.costUsd), 0) || 1;
  const operations = [...(usage.data?.byOperation ?? [])].sort((a, b) => b.costUsd - a.costUsd);
  const shown = operations.slice(0, TOP_OPERATIONS);
  const restCost = operations.slice(TOP_OPERATIONS).reduce((sum, row) => sum + row.costUsd, 0);

  return (
    <section className="space-y-4" aria-labelledby="admin-ai-cost-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 id="admin-ai-cost-title" className="text-xl font-semibold text-foreground">{t('admin.aiCost.title')}</h2><p className="text-sm text-muted-foreground">{t('admin.aiCost.description')}</p></div>
        <p className="text-xs text-muted-foreground">{t('admin.aiCost.sameRangeNote')}</p>
      </div>
      {revenue.isLoading || usage.isLoading ? <StatGridSkeleton columns={4} /> : null}
      {usage.isError ? <Alert variant="error"><AlertDescription>{t(errorKey)}</AlertDescription></Alert> : null}
      {usage.data && revenue.data ? (
        <>
          <StatGrid columns={4}>
            <StatCard label={t('admin.aiCost.total')} value={formatVnd(revenue.data.aiCostVnd, locale)} hint={t('admin.aiCost.totalUsd').replace('{usd}', formatUsd(usage.data.totalCostUsd, locale))} tone={usage.data.totalCostUsd > 0 ? 'warning' : 'neutral'} />
            <StatCard label={t('admin.aiCost.calls')} value={new Intl.NumberFormat(locale).format(usage.data.totalCalls)} hint={t('admin.aiCost.callsHint')} />
            <StatCard label={t('admin.aiCost.tokens')} value={formatTokens(usage.data.totalTokens, locale)} hint={t('admin.aiCost.tokensHint').replace('{prompt}', formatTokens(usage.data.promptTokens, locale)).replace('{output}', formatTokens(usage.data.outputTokens, locale))} />
            <StatCard label={t('admin.aiCost.audio')} value={formatAudioMinutes(usage.data.audioSeconds, locale)} hint={t('admin.aiCost.audioHint')} />
          </StatGrid>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="frame-satin bg-surface-raised lg:col-span-2"><CardHeader><CardTitle>{t('admin.aiCost.chartTitle')}</CardTitle></CardHeader><CardContent>
              <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
                <CartesianGrid stroke={CHART_GRID.stroke} vertical={false} /><XAxis dataKey="label" tick={{ fill: CHART_GRID.axis, fontSize: 11 }} /><YAxis domain={[0, yMax]} tick={{ fill: CHART_GRID.axis, fontSize: 11 }} tickFormatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value: unknown) => [formatUsd(typeof value === 'number' ? value : Number(value ?? 0), locale), t('admin.aiCost.total')]} />
                <Bar dataKey="costUsd" name={t('admin.aiCost.total')} fill={CHART_CATEGORICAL[1]} radius={[4, 4, 0, 0]} />
              </BarChart></ResponsiveContainer></div>
            </CardContent></Card>
            <Card className="frame-satin bg-surface-raised"><CardHeader><CardTitle>{t('admin.aiCost.byOperation')}</CardTitle></CardHeader><CardContent className="px-0">
              <Table aria-label={t('admin.aiCost.byOperation')}>
                <TableHeader><TableRow><TableHead>{t('admin.aiCost.operation')}</TableHead><TableHead className="text-right">{t('admin.aiCost.callsShort')}</TableHead><TableHead className="text-right">USD</TableHead></TableRow></TableHeader>
                <TableBody>
                  {shown.map((row) => (
                    <TableRow key={row.operation}><TableCell className="font-mono text-xs">{row.operation}</TableCell><TableCell className="text-right tabular-nums">{row.calls}</TableCell><TableCell className="text-right tabular-nums">{formatUsd(row.costUsd, locale)}</TableCell></TableRow>
                  ))}
                  {operations.length > TOP_OPERATIONS ? <TableRow><TableCell className="text-xs text-muted-foreground">{t('admin.aiCost.othersRow').replace('{n}', String(operations.length - TOP_OPERATIONS))}</TableCell><TableCell /><TableCell className="text-right tabular-nums text-muted-foreground">{formatUsd(restCost, locale)}</TableCell></TableRow> : null}
                  {operations.length === 0 ? <TableRow><TableCell colSpan={3} className="text-sm text-muted-foreground">{t('admin.aiCost.empty')}</TableCell></TableRow> : null}
                </TableBody>
              </Table>
            </CardContent></Card>
          </div>
        </>
      ) : null}
    </section>
  );
}
