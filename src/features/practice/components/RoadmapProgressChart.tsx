import { memo, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '@/shared/languages';
import { CHART_GRID, CHART_RADAR, chartCategoryColor } from '@/shared/charts/chartColors';
import type { RoadmapProgressPoint } from '../types/roadmapPractice.api.types';
import {
  buildProgressRows,
  canPlotTrend,
  collectCriterionNames,
  criterionKey,
} from './roadmapProgressSeries';

interface RoadmapProgressChartProps {
  progress: RoadmapProgressPoint[];
  /** Ngưỡng đạt theo cấp độ. `null` = không biết ⇒ không vẽ đường ngang. */
  threshold?: number | null;
}

export const RoadmapProgressChart = memo(function RoadmapProgressChart({
  progress,
  threshold = null,
}: RoadmapProgressChartProps) {
  const { t } = useLanguage();
  const criterionNames = useMemo(() => collectCriterionNames(progress), [progress]);
  const rows = useMemo(
    () => buildProgressRows(progress, criterionNames),
    [progress, criterionNames],
  );
  // Mặc định KHÔNG bật tiêu chí nào: sáu đường cùng lúc là một mớ chỉ rối,
  // người đọc không rút ra được gì. Đường điểm tổng mới là câu trả lời chính.
  const [selected, setSelected] = useState<readonly string[]>([]);

  const toggle = (name: string) => {
    setSelected((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
  };

  if (!canPlotTrend(progress)) {
    return (
      <section className="rounded-2xl border border-satin bg-surface-raised p-6">
        <h2 className="heading-secondary text-xl text-foreground">
          {t('practice.learningPath.progressChartTitle')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('practice.learningPath.progressChartTooFew')}
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="roadmap-progress-chart-title"
      className="rounded-2xl border border-satin bg-surface-raised p-6"
    >
      <div className="mb-4">
        <h2
          id="roadmap-progress-chart-title"
          className="heading-secondary text-xl text-foreground"
        >
          {t('practice.learningPath.progressChartTitle')}
        </h2>
        <p className="mt-1 body-text text-sm text-muted-foreground">
          {t('practice.learningPath.progressChartDesc')}
        </p>
      </div>

      <div className="h-[320px] w-full" data-testid="roadmap-progress-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: -12 }}>
            <CartesianGrid stroke={CHART_GRID.stroke} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: CHART_GRID.axis, fontSize: 12 }}
              tickFormatter={(value: string) =>
                value.length > 18 ? `${value.slice(0, 17)}…` : value
              }
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: CHART_GRID.axis, fontSize: 12 }}
              tickFormatter={(value: number) => `${value}%`}
            />
            <Tooltip
              formatter={(value: number | null) => (value == null ? '—' : `${value}%`)}
              contentStyle={{
                background: 'var(--chart-tooltip-bg)',
                border: '1px solid var(--chart-tooltip-border)',
                borderRadius: 12,
              }}
            />
            {threshold != null ? (
              <ReferenceLine
                y={threshold}
                stroke={CHART_RADAR.targetStroke}
                strokeDasharray="4 4"
                label={{
                  value: `${t('practice.learningPath.levelThreshold')} ${threshold}%`,
                  position: 'insideTopRight',
                  fill: CHART_RADAR.targetStroke,
                  fontSize: 11,
                }}
              />
            ) : null}
            <Line
              type="monotone"
              dataKey="overall"
              name={t('practice.learningPath.progressChartOverall')}
              stroke={CHART_RADAR.stroke}
              strokeWidth={2.5}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
            {criterionNames.map((name, index) =>
              selected.includes(name) ? (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={criterionKey(index)}
                  name={name}
                  stroke={chartCategoryColor(index + 1)}
                  strokeWidth={1.5}
                  dot={{ r: 3 }}
                  /*
                    Buổi không chấm tiêu chí này ⇒ giá trị `null` ⇒ đường phải ĐỨT.
                    Nối liền qua chỗ khuyết là vẽ ra một đoạn số liệu chưa từng đo được.
                  */
                  connectNulls={false}
                />
              ) : null,
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {criterionNames.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">
            {t('practice.learningPath.progressChartToggleHint')}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {criterionNames.map((name, index) => {
              const active = selected.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggle(name)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition ${
                    active
                      ? 'border-transparent text-foreground'
                      : 'border-subtle text-muted-foreground hover:text-foreground'
                  }`}
                  style={
                    active
                      ? { background: `color-mix(in srgb, ${chartCategoryColor(index + 1)} 22%, transparent)` }
                      : undefined
                  }
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: chartCategoryColor(index + 1) }}
                    aria-hidden
                  />
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
});
