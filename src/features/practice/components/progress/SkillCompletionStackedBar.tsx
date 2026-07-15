import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '@/shared/languages';
import type { ProgressSkillBreakdownItem } from '../../types/progress.types';
import { ProgressSection } from './ProgressSection';

export function SkillCompletionStackedBar({ skills }: { skills: ProgressSkillBreakdownItem[] }) {
  const { t, language } = useLanguage();

  const chartData = skills.map((skill) => ({
    name: language === 'vi' ? skill.nameVi : skill.name,
    completed: skill.completed,
    inProgress: skill.inProgress,
  }));

  return (
    <ProgressSection
      title={t('practice.progress.skills.title')}
      description={t('practice.progress.skills.caption')}
    >
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="28%" margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--isas-gray-400)', fontSize: 11 }}
              interval={0}
              angle={-18}
              textAnchor="end"
              height={56}
            />
            <YAxis allowDecimals={false} tick={{ fill: 'var(--isas-gray-400)', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: 12,
              }}
            />
            <Legend
              formatter={(value) => t(`practice.progress.status.${value === 'completed' ? 'completed' : 'inProgress'}`)}
            />
            <Bar
              dataKey="completed"
              stackId="skill"
              fill="var(--isas-gray-50)"
              radius={[0, 0, 0, 0]}
              name="completed"
            />
            <Bar
              dataKey="inProgress"
              stackId="skill"
              fill="var(--isas-gray-500)"
              radius={[4, 4, 0, 0]}
              name="inProgress"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ProgressSection>
  );
}
