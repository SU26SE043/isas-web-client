import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '@/shared/languages';
import type { ProgressRoadmapCompletion } from '../../types/progress.types';
import { getRoadmapCompletionPercent } from '../../types/progress.types';
import { ProgressSection } from './ProgressSection';

const SLICE_COLORS = {
  completed: 'var(--isas-gray-50)',
  inProgress: 'var(--isas-gray-400)',
  locked: 'var(--isas-gray-700)',
} as const;

export function RoadmapCompletionDonut({ data }: { data: ProgressRoadmapCompletion }) {
  const { t } = useLanguage();
  const percent = getRoadmapCompletionPercent(data);

  const chartData = [
    { key: 'completed', value: data.completed, color: SLICE_COLORS.completed },
    { key: 'inProgress', value: data.inProgress, color: SLICE_COLORS.inProgress },
    { key: 'locked', value: data.locked, color: SLICE_COLORS.locked },
  ].filter((slice) => slice.value > 0);

  const legendItems = [
    { key: 'completed' as const, color: SLICE_COLORS.completed, count: data.completed },
    { key: 'inProgress' as const, color: SLICE_COLORS.inProgress, count: data.inProgress },
    { key: 'locked' as const, color: SLICE_COLORS.locked, count: data.locked },
  ];

  return (
    <ProgressSection
      title={t('practice.progress.roadmap.title')}
      description={t('practice.progress.roadmap.caption')}
    >
      <div className="relative mx-auto h-72 w-full max-w-sm">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="key"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="var(--surface-base)"
              strokeWidth={2}
            >
              {chartData.map((slice) => (
                <Cell key={slice.key} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: 12,
              }}
              formatter={(value, name) => [
                String(value ?? 0),
                t(`practice.progress.status.${String(name)}`),
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-4xl font-semibold tabular-nums text-foreground">{percent}%</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
            {t('practice.progress.roadmap.centerLabel')}
          </p>
        </div>
      </div>
      <ul className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
        {legendItems.map((item) => (
          <li key={item.key} className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: item.color }} aria-hidden />
            <span>
              {t(`practice.progress.status.${item.key}`)} · {item.count}
            </span>
          </li>
        ))}
      </ul>
    </ProgressSection>
  );
}
