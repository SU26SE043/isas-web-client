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

const chartColors = {
  current: '#02462E',
  target: '#FEC700',
  grid: 'rgba(2, 70, 46, 0.12)',
  text: '#0F172A',
  tooltipBorder: 'rgba(2, 70, 46, 0.12)',
  tooltipBg: '#FFFFFF',
} as const;

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
    <div className="rounded-2xl border border-[rgba(2,70,46,0.12)] bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-pine">
        {language === 'vi' ? item.subjectVi : item.subject}
      </p>
      <div className="mt-2 space-y-1 text-sm text-slate-700">
        <div className="flex items-center justify-between gap-4">
          <span>{t('practice.radar.current')}</span>
          <span className="font-semibold text-pine">{item.A}%</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>{t('practice.radar.target')}</span>
          <span className="font-semibold text-[#A97D00]">{item.B}%</span>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">{label ?? ''}</p>
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
      fill: chartColors.text,
      fontSize: 12,
      fontWeight: 600,
    }),
    []
  );

  return (
    <section aria-labelledby="skill-radar-chart-title" className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2
            id="skill-radar-chart-title"
            className="heading-secondary text-2xl text-pine"
          >
            {t('practice.result.skillOverview')}
          </h2>
          <p className="mt-1 body-text text-sm text-black/70">
            {t('practice.result.skillOverviewDesc')}
          </p>
        </div>
      </div>

      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke={chartColors.grid} />
            <PolarAngleAxis
              dataKey={language === 'vi' ? 'subjectVi' : 'subject'}
              tick={axisTickStyle}
            />
            <Tooltip content={<CustomTooltip language={language} />} />
            <Radar
              name={t('practice.radar.current')}
              dataKey="A"
              stroke={chartColors.current}
              fill={chartColors.current}
              fillOpacity={0.18}
              strokeWidth={2}
              dot={{ r: 3, fill: chartColors.current }}
              activeDot={{ r: 5 }}
            />
            <Radar
              name={t('practice.radar.target')}
              dataKey="B"
              stroke={chartColors.target}
              fill={chartColors.target}
              fillOpacity={0.1}
              strokeWidth={2}
              dot={{ r: 3, fill: chartColors.target }}
              activeDot={{ r: 5 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-pine" />
          <span className="text-black/70">{t('practice.radar.current')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-milk" />
          <span className="text-black/70">{t('practice.radar.target')}</span>
        </div>
      </div>
    </section>
  );
});