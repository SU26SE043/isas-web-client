import React, { useMemo } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useLanguage } from '@/shared/languages';
import type { CvSkillDimension } from '../../types/cvAnalysis.types';
import { CV_CHART_COLORS } from '../../utils/cvChartColors';
import { CvFlowSectionCard } from '../flow/CvFlowSectionCard';

interface CvSkillRadarChartProps {
  dimensions: CvSkillDimension[];
}

interface TooltipPayload {
  active?: boolean;
  payload?: Array<{ payload?: CvSkillDimension & { label: string } }>;
}

function RadarTooltip({ active, payload }: TooltipPayload) {
  const { t } = useLanguage();
  if (!active || !payload?.[0]?.payload) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-subtle bg-surface-raised px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-foreground">{item.label}</p>
      <p className="mt-1 text-muted-foreground">
        {t('result.score')}: <span className="font-medium text-foreground">{item.score}%</span>
      </p>
      <p className="text-muted-foreground">
        {t('result.target')}: <span className="font-medium text-warning">{item.target}%</span>
      </p>
    </div>
  );
}

export const CvSkillRadarChart: React.FC<CvSkillRadarChartProps> = ({ dimensions }) => {
  const { language, t } = useLanguage();

  const data = useMemo(
    () =>
      dimensions.map((dim) => ({
        ...dim,
        label: language === 'vi' ? dim.labelVi : dim.labelEn,
      })),
    [dimensions, language],
  );

  return (
    <CvFlowSectionCard title={t('result.skillRadar')} description={t('result.skillRadarDesc')}>
      <div className="h-[280px] w-full sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke={CV_CHART_COLORS.grid} />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fill: CV_CHART_COLORS.axis, fontSize: 11, fontWeight: 600 }}
            />
            <Tooltip content={<RadarTooltip />} />
            <Radar
              name={t('result.score')}
              dataKey="score"
              stroke={CV_CHART_COLORS.radarStroke}
              fill={CV_CHART_COLORS.radarFill}
              fillOpacity={1}
              strokeWidth={2}
              dot={{ r: 3, fill: CV_CHART_COLORS.radarStroke }}
            />
            <Radar
              name={t('result.target')}
              dataKey="target"
              stroke={CV_CHART_COLORS.radarTargetStroke}
              fill={CV_CHART_COLORS.radarTargetFill}
              fillOpacity={1}
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 2, fill: CV_CHART_COLORS.radarTargetStroke }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-info" aria-hidden />
          {t('result.score')}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-warning" aria-hidden />
          {t('result.target')}
        </span>
      </div>
    </CvFlowSectionCard>
  );
};
