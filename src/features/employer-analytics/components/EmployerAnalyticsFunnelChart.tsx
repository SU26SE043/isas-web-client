import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_GRID, CHART_TOOLTIP_STYLE, chartCategoryColor } from '@/shared/charts/chartColors';
import { useLanguage } from '@/shared/languages';
import type { EmployerAnalytics } from '../types/employerAnalytics.types';
import { AnalyticsCard } from './AnalyticsCard';

type Stage = 'invited' | 'joined' | 'started' | 'completed' | 'scored' | 'passed';

/** Phễu: Mời → Tham gia → Bắt đầu → Hoàn thành → Đã chấm → Đạt. Mỗi bậc là số HIỆN TẠI của cả org. */
export function buildFunnelStages(data: EmployerAnalytics): Array<{ stage: Stage; value: number }> {
  return [
    { stage: 'invited', value: data.invitations.total },
    { stage: 'joined', value: data.interviews.joined },
    { stage: 'started', value: data.interviews.started },
    { stage: 'completed', value: data.interviews.completed },
    { stage: 'scored', value: data.interviews.scored },
    { stage: 'passed', value: data.interviews.passed },
  ];
}

export function EmployerAnalyticsFunnelChart({ data }: { data: EmployerAnalytics }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const rows = buildFunnelStages(data).map((row) => ({
    ...row,
    label: t(`employerAnalytics.funnel.${row.stage}`),
  }));
  const { invitations } = data;
  const invitationLine = t('employerAnalytics.funnel.invitations')
    .replace('{sent}', invitations.sent.toLocaleString(locale))
    .replace('{queued}', invitations.queued.toLocaleString(locale))
    .replace('{expired}', invitations.expired.toLocaleString(locale))
    .replace('{revoked}', invitations.revoked.toLocaleString(locale));

  return (
    <AnalyticsCard
      title={t('employerAnalytics.funnel.title')}
      description={t('employerAnalytics.funnel.description')}
      contentClassName="space-y-3"
    >
      <figure aria-labelledby="employer-analytics-funnel-title">
        <figcaption id="employer-analytics-funnel-title" className="sr-only">
          {t('employerAnalytics.funnel.description')}
        </figcaption>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {/* layout="vertical" = thanh nằm ngang: XAxis type="number", YAxis type="category" (recharts 3). */}
            <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fill: CHART_GRID.axis, fontSize: 11 }} />
              <YAxis type="category" dataKey="label" width={92} tick={{ fill: CHART_GRID.axis, fontSize: 11 }} />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                cursor={{ fill: 'var(--surface-highlight)' }}
                formatter={(value) => [String(value), t('employerAnalytics.funnel.candidates')]}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                {/* Một màu cho cả phễu — độ dài thanh đã nói hết; 6 màu cầu vồng chỉ thêm việc cho mắt.
                    Riêng bậc "Đạt" đổi màu vì đó là kết luận HR cần dừng lại. */}
                {rows.map((row) => (
                  <Cell key={row.stage} fill={chartCategoryColor(row.stage === 'passed' ? 1 : 0)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <table className="sr-only" data-testid="employer-analytics-funnel-table">
          <tbody>
            {rows.map((row) => (
              <tr key={row.stage}>
                <th scope="row">{row.label}</th>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
      <p className="text-xs text-muted-foreground">{invitationLine}</p>
    </AnalyticsCard>
  );
}
