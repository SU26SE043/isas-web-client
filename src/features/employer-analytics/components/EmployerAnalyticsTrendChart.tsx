import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_CATEGORICAL, CHART_GRID, CHART_TOOLTIP_STYLE } from '@/shared/charts/chartColors';
import { useLanguage } from '@/shared/languages';
import type { EmployerAnalyticsBucket, EmployerAnalyticsGranularity } from '../types/employerAnalytics.types';
import { AnalyticsCard } from './AnalyticsCard';

const SERIES = ['campaignsCreated', 'invitationsSent', 'joins', 'interviewsStarted', 'scored'] as const;
const DASHES: Record<(typeof SERIES)[number], string | undefined> = {
  campaignsCreated: undefined,
  invitationsSent: '7 4',
  joins: '2 4',
  interviewsStarted: '10 3',
  scored: '4 2',
};

interface EmployerAnalyticsTrendChartProps {
  /** Đã điền 0 cho mốc trống (`fillAnalyticsBuckets`) — biểu đồ chỉ vẽ, không tự điền. */
  buckets: EmployerAnalyticsBucket[];
  granularity: EmployerAnalyticsGranularity;
}

export function EmployerAnalyticsTrendChart({ buckets, granularity }: EmployerAnalyticsTrendChartProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const formatter = new Intl.DateTimeFormat(
    locale,
    granularity === 'month' ? { month: 'short', year: 'numeric', timeZone: 'UTC' } : { month: 'short', day: 'numeric', timeZone: 'UTC' },
  );
  const rows = buckets.map((bucket) => ({ ...bucket, label: formatter.format(new Date(bucket.periodStart)) }));
  const hasActivity = buckets.some((bucket) => SERIES.some((key) => bucket[key] > 0));
  const seriesLabel = (key: (typeof SERIES)[number]) => t(`employerAnalytics.trend.${key}`);

  return (
    <AnalyticsCard title={t('employerAnalytics.trend.title')} description={t('employerAnalytics.trend.description')}>
      {rows.length === 0 || !hasActivity ? (
        <p className="text-sm text-muted-foreground">{t('employerAnalytics.trend.empty')}</p>
      ) : (
        <figure aria-labelledby="employer-analytics-trend-title">
          <figcaption id="employer-analytics-trend-title" className="sr-only">
            {t('employerAnalytics.trend.description')}
          </figcaption>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 8, right: 12, left: -12, bottom: 8 }}>
                <CartesianGrid stroke={CHART_GRID.stroke} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: CHART_GRID.axis, fontSize: 11 }} minTickGap={16} />
                <YAxis allowDecimals={false} tick={{ fill: CHART_GRID.axis, fontSize: 11 }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                {/* Legend đặt TRÊN: ở 375px năm nhãn xuống 3 dòng, để dưới sẽ đè lên nhãn trục X. */}
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12, paddingBottom: 12 }} />
                {SERIES.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={seriesLabel(key)}
                    stroke={CHART_CATEGORICAL[index]}
                    strokeWidth={2}
                    strokeDasharray={DASHES[key]}
                    dot={rows.length <= 45 ? { r: 2 } : false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only" data-testid="employer-analytics-trend-table">
            <thead>
              <tr>
                <th>{t('employerAnalytics.trend.period')}</th>
                {SERIES.map((key) => <th key={key}>{seriesLabel(key)}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.periodStart}>
                  <td>{row.label}</td>
                  {SERIES.map((key) => <td key={key}>{row[key]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      )}
    </AnalyticsCard>
  );
}
