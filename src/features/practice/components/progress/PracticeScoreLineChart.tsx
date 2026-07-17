import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '@/shared/languages';
import {
  CHART_CATEGORICAL,
  CHART_GRID,
  CHART_TOOLTIP_STYLE,
} from '@/shared/charts/chartColors';
import type { ProgressPracticeScorePoint } from '../../types/progress.types';
import { ProgressSection } from './ProgressSection';

export function PracticeScoreLineChart({ points }: { points: ProgressPracticeScorePoint[] }) {
  const { t, language } = useLanguage();

  const chartData = points.map((point) => ({
    label: language === 'vi' ? point.sessionLabelVi : point.sessionLabel,
    score: point.score,
  }));

  return (
    <ProgressSection
      title={t('practice.progress.scores.title')}
      description={t('practice.progress.scores.caption')}
    >
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid stroke={CHART_GRID.stroke} vertical={false} strokeOpacity={0.85} />
            <XAxis
              dataKey="label"
              tick={{ fill: CHART_GRID.axis, fontSize: 11 }}
              label={{
                value: t('practice.progress.scores.xAxis'),
                position: 'insideBottom',
                offset: -2,
                fill: CHART_GRID.axis,
                fontSize: 11,
              }}
              height={48}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: CHART_GRID.axis, fontSize: 11 }}
              label={{
                value: t('practice.progress.scores.yAxis'),
                angle: -90,
                position: 'insideLeft',
                fill: CHART_GRID.axis,
                fontSize: 11,
              }}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(value) => [String(value ?? 0), t('practice.progress.scores.series')]}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke={CHART_CATEGORICAL[0]}
              strokeWidth={2.5}
              dot={{ r: 4, fill: CHART_CATEGORICAL[0], strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ProgressSection>
  );
}
