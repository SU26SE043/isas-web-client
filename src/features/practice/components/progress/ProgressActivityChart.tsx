import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '@/shared/languages';
import type { ProgressDashboardData } from '../../types/learning.types';

interface ProgressActivityChartProps {
  data: ProgressDashboardData;
}

export function ProgressActivityChart({ data }: ProgressActivityChartProps) {
  const { t, language } = useLanguage();
  const chartData = data.weeklyActivity.map((point) => ({
    label: language === 'vi' ? point.weekLabelVi : point.weekLabel,
    sessions: point.sessions,
    averageScore: point.averageScore,
  }));

  return (
    <section className="rounded-xl border border-subtle bg-surface-raised p-6">
      <h2 className="heading-secondary text-lg text-foreground">{t('practice.progress.activityTitle')}</h2>
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
            <YAxis tick={{ fill: '#a1a1aa', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: '#141416',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
              }}
            />
            <Bar dataKey="sessions" fill="#fafafa" radius={[6, 6, 0, 0]} name={t('practice.progress.sessions')} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
