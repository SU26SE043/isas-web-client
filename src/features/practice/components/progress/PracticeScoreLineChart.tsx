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
            <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--isas-gray-400)', fontSize: 11 }}
              label={{
                value: t('practice.progress.scores.xAxis'),
                position: 'insideBottom',
                offset: -2,
                fill: 'var(--isas-gray-500)',
                fontSize: 11,
              }}
              height={48}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: 'var(--isas-gray-400)', fontSize: 11 }}
              label={{
                value: t('practice.progress.scores.yAxis'),
                angle: -90,
                position: 'insideLeft',
                fill: 'var(--isas-gray-500)',
                fontSize: 11,
              }}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: 12,
              }}
              formatter={(value) => [String(value ?? 0), t('practice.progress.scores.series')]}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--isas-gray-50)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: 'var(--isas-gray-50)', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ProgressSection>
  );
}
