import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_GRID, CHART_TOOLTIP_STYLE, chartCategoryColor } from '@/shared/charts/chartColors';
import { useLanguage } from '@/shared/languages';
import type { EmployerAnalyticsBandCount } from '../types/employerAnalytics.types';
import { AnalyticsCard } from './AnalyticsCard';

interface EmployerAnalyticsBandChartProps {
  id: string;
  title: string;
  description: string;
  bands: EmployerAnalyticsBandCount[];
  colorIndex?: number;
}

/** Phân bố 5 dải điểm (0-19 … 80-100). Parser đã điền đủ 5 dải nên cột không bao giờ "biến mất". */
export function EmployerAnalyticsBandChart({ id, title, description, bands, colorIndex = 0 }: EmployerAnalyticsBandChartProps) {
  const { t } = useLanguage();
  const total = bands.reduce((sum, band) => sum + band.count, 0);

  return (
    <AnalyticsCard title={title} description={description}>
      {total === 0 ? (
        <p className="text-sm text-muted-foreground">{t('employerAnalytics.distribution.empty')}</p>
      ) : (
        <figure aria-labelledby={`${id}-title`}>
          <figcaption id={`${id}-title`} className="sr-only">{description}</figcaption>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bands} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid stroke={CHART_GRID.stroke} vertical={false} />
                <XAxis dataKey="band" tick={{ fill: CHART_GRID.axis, fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: CHART_GRID.axis, fontSize: 11 }} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  cursor={{ fill: 'var(--surface-highlight)' }}
                  formatter={(value) => [String(value), t('employerAnalytics.distribution.count')]}
                />
                <Bar dataKey="count" fill={chartCategoryColor(colorIndex)} radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only" data-testid={`${id}-table`}>
            <thead>
              <tr>
                <th>{t('employerAnalytics.distribution.band')}</th>
                <th>{t('employerAnalytics.distribution.count')}</th>
              </tr>
            </thead>
            <tbody>
              {bands.map((band) => (
                <tr key={band.band}>
                  <td>{band.band}</td>
                  <td>{band.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      )}
    </AnalyticsCard>
  );
}
