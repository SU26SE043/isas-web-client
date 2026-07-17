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
import {
  CHART_CATEGORICAL,
  CHART_GRID,
  CHART_TOOLTIP_STYLE,
} from '@/shared/charts/chartColors';
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
            <CartesianGrid stroke={CHART_GRID.stroke} vertical={false} strokeOpacity={0.85} />
            <XAxis
              dataKey="name"
              tick={{ fill: CHART_GRID.axis, fontSize: 11 }}
              interval={0}
              angle={-18}
              textAnchor="end"
              height={56}
            />
            <YAxis allowDecimals={false} tick={{ fill: CHART_GRID.axis, fontSize: 11 }} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Legend
              formatter={(value) =>
                t(`practice.progress.status.${value === 'completed' ? 'completed' : 'inProgress'}`)
              }
            />
            <Bar
              dataKey="completed"
              stackId="skill"
              fill={CHART_CATEGORICAL[1]}
              radius={[0, 0, 0, 0]}
              name="completed"
            />
            <Bar
              dataKey="inProgress"
              stackId="skill"
              fill={CHART_CATEGORICAL[2]}
              radius={[4, 4, 0, 0]}
              name="inProgress"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ProgressSection>
  );
}
