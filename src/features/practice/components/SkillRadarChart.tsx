import { memo, useMemo } from 'react';
import { useLanguage } from '../../../shared/languages';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { CHART_GRID, CHART_RADAR } from '@/shared/charts/chartColors';
import type { RadarData } from '../types/result.types';

type Language = 'vi' | 'en';

interface SkillRadarChartProps {
  data: RadarData[];
  language: Language;
}

interface TooltipPayloadItem {
  payload?: RadarData;
  value?: number;
  name?: string;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  language: Language;
}

const CustomTooltip = memo(function CustomTooltip({
  active,
  payload,
  label,
  language,
}: CustomTooltipProps) {
  const { t } = useLanguage();
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div
      className="rounded-xl border px-4 py-3 shadow-lg"
      style={{
        background: 'var(--chart-tooltip-bg)',
        borderColor: 'var(--chart-tooltip-border)',
        boxShadow: 'var(--chart-tooltip-shadow)',
      }}
    >
      <p className="text-sm font-semibold text-foreground">
        {language === 'vi' ? item.subjectVi : item.subject}
      </p>
      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ background: CHART_RADAR.stroke }}
              aria-hidden
            />
            {t('practice.radar.current')}
          </span>
          <span className="font-semibold text-foreground">{item.A}%</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ background: CHART_RADAR.targetStroke }}
              aria-hidden
            />
            {t('practice.radar.target')}
          </span>
          <span className="font-semibold" style={{ color: CHART_RADAR.targetStroke }}>
            {item.B}%
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{label ?? ''}</p>
    </div>
  );
});

export const SkillRadarChart = memo(function SkillRadarChart({
  data,
  language,
}: SkillRadarChartProps) {
  const { t } = useLanguage();
  const axisTickStyle = useMemo(
    () => ({
      fill: CHART_GRID.axis,
      fontSize: 12,
      fontWeight: 500,
    }),
    [],
  );

  return (
    <section
      aria-labelledby="skill-radar-chart-title"
      className="rounded-3xl border border-subtle bg-surface-raised p-6 shadow-sm"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 id="skill-radar-chart-title" className="heading-secondary text-2xl text-foreground">
            {t('practice.result.skillOverview')}
          </h2>
          <p className="mt-1 body-text text-sm text-muted-foreground">
            {t('practice.result.skillOverviewDesc')}
          </p>
        </div>
      </div>

      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke={CHART_GRID.stroke} />
            <PolarAngleAxis
              dataKey={language === 'vi' ? 'subjectVi' : 'subject'}
              tick={axisTickStyle}
            />
            <Tooltip content={<CustomTooltip language={language} />} />
            <Radar
              name={t('practice.radar.current')}
              dataKey="A"
              stroke={CHART_RADAR.stroke}
              fill={CHART_RADAR.fill}
              fillOpacity={CHART_RADAR.fillOpacity}
              strokeWidth={CHART_RADAR.strokeWidth}
              dot={{ r: 3, fill: CHART_RADAR.stroke }}
              activeDot={{ r: 5 }}
            />
            <Radar
              name={t('practice.radar.target')}
              dataKey="B"
              stroke={CHART_RADAR.targetStroke}
              fill={CHART_RADAR.targetFill}
              fillOpacity={CHART_RADAR.targetFillOpacity}
              strokeWidth={CHART_RADAR.strokeWidth}
              dot={{ r: 3, fill: CHART_RADAR.targetStroke }}
              activeDot={{ r: 5 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: CHART_RADAR.stroke }}
            aria-hidden
          />
          <span className="text-muted-foreground">{t('practice.radar.current')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: CHART_RADAR.targetStroke }}
            aria-hidden
          />
          <span className="text-muted-foreground">{t('practice.radar.target')}</span>
        </div>
      </div>
    </section>
  );
});
