import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CHART_CATEGORICAL,
  CHART_GRID,
  CHART_TOOLTIP_STYLE,
} from '@/shared/charts/chartColors';
import { useLanguage } from '@/shared/languages';
import type { AdminAnalyticsBucket } from '../../types/adminAnalytics.types';

export function AdminAnalyticsChart({ buckets }: { buckets: AdminAnalyticsBucket[] }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const data = buckets.map((bucket) => ({
    ...bucket,
    label: new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
    }).format(new Date(bucket.periodStart)),
  }));

  return (
    <Card className="frame-satin bg-surface-raised lg:col-span-2">
      <CardHeader>
        <CardTitle>{t('admin.analytics.trendTitle')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('admin.analytics.trendDescription')}</p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('admin.analytics.empty')}</p>
        ) : (
          <figure aria-labelledby="admin-analytics-chart-title">
          <figcaption id="admin-analytics-chart-title" className="sr-only">
            {t('admin.analytics.trendDescription')}
          </figcaption>
          <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>{t('admin.analytics.newUsers')}</span>
            <span>{t('admin.analytics.logins')}</span>
            <span>{t('admin.analytics.distinctUsers')}</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 8 }}>
                <CartesianGrid stroke={CHART_GRID.stroke} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: CHART_GRID.axis, fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: CHART_GRID.axis, fontSize: 11 }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="newUsers" name={t('admin.analytics.newUsers')} stroke={CHART_CATEGORICAL[0]} strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="logins" name={t('admin.analytics.logins')} stroke={CHART_CATEGORICAL[1]} strokeWidth={2.5} strokeDasharray="7 4" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="distinctUsers" name={t('admin.analytics.distinctUsers')} stroke={CHART_CATEGORICAL[2]} strokeWidth={2.5} strokeDasharray="2 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only">
            <thead>
              <tr>
                <th>{t('admin.analytics.period')}</th>
                <th>{t('admin.analytics.newUsers')}</th>
                <th>{t('admin.analytics.logins')}</th>
                <th>{t('admin.analytics.distinctUsers')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((bucket) => (
                <tr key={bucket.periodStart}>
                  <td>{bucket.label}</td>
                  <td>{bucket.newUsers}</td>
                  <td>{bucket.logins}</td>
                  <td>{bucket.distinctUsers}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </figure>
        )}
      </CardContent>
    </Card>
  );
}
