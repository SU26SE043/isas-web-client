import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '@/shared/languages';
import type { ProgressScoreHistoryPoint } from '../../types/progress.types';
import { ProgressSection } from './ProgressSection';

export function ProgressScoreHistoryChart({ points }: { points: ProgressScoreHistoryPoint[] }) {
  const { t, language } = useLanguage();

  const chartData = points.map((point) => ({
    ...point,
    label: language === 'vi' ? point.labelVi : point.label,
  }));

  return (
    <ProgressSection
      title={t('practice.progress.sections.scoreHistory')}
      description={t('practice.progress.sections.scoreHistoryDesc')}
    >
      <div className="h-72 w-full">
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('practice.progress.empty')}</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--isas-gray-400)', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--isas-gray-400)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 12,
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="overall" stroke="var(--isas-gray-50)" strokeWidth={2} name={t('practice.progress.chart.overall')} />
              <Line type="monotone" dataKey="technical" stroke="var(--isas-gray-300)" strokeWidth={1.5} name={t('practice.progress.chart.technical')} />
              <Line type="monotone" dataKey="communication" stroke="var(--isas-gray-400)" strokeWidth={1.5} name={t('practice.progress.chart.communication')} />
              <Line type="monotone" dataKey="problemSolving" stroke="var(--isas-gray-500)" strokeWidth={1.5} name={t('practice.progress.chart.problemSolving')} />
              <Line type="monotone" dataKey="behavioral" stroke="var(--isas-gray-600)" strokeWidth={1.5} name={t('practice.progress.chart.behavioral')} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {points
          .filter((point) => point.reportId)
          .map((point) => (
            <li key={point.id}>
              <Link
                to={`/candidate/practice/history/${point.reportId}`}
                className="btn-ghost inline-flex text-xs"
              >
                {(language === 'vi' ? point.labelVi : point.label)} · {point.overall}%
              </Link>
            </li>
          ))}
      </ul>
      <p className="mt-2 text-caption text-muted-foreground">{t('practice.progress.scoreHistory.clickHint')}</p>
    </ProgressSection>
  );
}
