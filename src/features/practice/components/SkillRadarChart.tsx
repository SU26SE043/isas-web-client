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
  showThreshold?: boolean;
  yourScoreLabel?: string;
  thresholdLabel?: string;
  title?: string;
  description?: string;
  /** Hide outer card chrome when nested inside another section. */
  embedded?: boolean;
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
  language: Language;
  showThreshold: boolean;
  yourScoreLabel: string;
  thresholdLabel: string;
}

const CustomTooltip = memo(function CustomTooltip({
  active,
  payload,
  language,
  showThreshold,
  yourScoreLabel,
  thresholdLabel,
}: CustomTooltipProps) {
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
            {yourScoreLabel}
          </span>
          <span className="font-semibold text-foreground">
            {item.rawScore != null && item.maxScore != null
              ? `${item.rawScore}/${item.maxScore} (${item.A}%)`
              : `${item.A}%`}
          </span>
        </div>
        {showThreshold ? (
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ background: CHART_RADAR.targetStroke }}
                aria-hidden
              />
              {thresholdLabel}
            </span>
            <span className="font-semibold" style={{ color: CHART_RADAR.targetStroke }}>
              {item.B}%
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
});

export const SkillRadarChart = memo(function SkillRadarChart({
  data,
  language,
  showThreshold = true,
  yourScoreLabel,
  thresholdLabel,
  title,
  description,
  embedded = false,
}: SkillRadarChartProps) {
  const { t } = useLanguage();
  const currentLabel = yourScoreLabel ?? t('practice.radar.current');
  const targetLabel = thresholdLabel ?? t('practice.radar.target');
  const heading = title ?? t('practice.result.skillOverview');
  const desc = description ?? t('practice.result.skillOverviewDesc');
  const axisTickStyle = useMemo(
    () => ({
      fill: CHART_GRID.axis,
      fontSize: 12,
      fontWeight: 500,
    }),
    [],
  );

  const chart = (
    <>
      {!embedded ? (
        <div className="mb-4">
          <h2 id="skill-radar-chart-title" className="heading-secondary text-xl text-foreground">
            {heading}
          </h2>
          <p className="mt-1 body-text text-sm text-muted-foreground">{desc}</p>
        </div>
      ) : null}

      <div className={embedded ? 'h-[320px] w-full' : 'h-[360px] w-full'}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke={CHART_GRID.stroke} />
            <PolarAngleAxis
              dataKey={language === 'vi' ? 'subjectVi' : 'subject'}
              tick={axisTickStyle}
            />
            <Tooltip
              content={
                <CustomTooltip
                  language={language}
                  showThreshold={showThreshold}
                  yourScoreLabel={currentLabel}
                  thresholdLabel={targetLabel}
                />
              }
            />
            <Radar
              name={currentLabel}
              dataKey="A"
              stroke={CHART_RADAR.stroke}
              fill={CHART_RADAR.fill}
              fillOpacity={CHART_RADAR.fillOpacity}
              strokeWidth={CHART_RADAR.strokeWidth}
              dot={{ r: 3, fill: CHART_RADAR.stroke }}
              activeDot={{ r: 5 }}
            />
            {showThreshold ? (
              <Radar
                name={targetLabel}
                dataKey="B"
                stroke={CHART_RADAR.targetStroke}
                fill={CHART_RADAR.targetFill}
                fillOpacity={CHART_RADAR.targetFillOpacity}
                strokeWidth={CHART_RADAR.strokeWidth}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: CHART_RADAR.targetStroke }}
                activeDot={{ r: 5 }}
              />
            ) : null}
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
          <span className="text-muted-foreground">{currentLabel}</span>
        </div>
        {showThreshold ? (
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: CHART_RADAR.targetStroke }}
              aria-hidden
            />
            <span className="text-muted-foreground">{targetLabel}</span>
          </div>
        ) : null}
      </div>
    </>
  );

  if (embedded) {
    return <div aria-label={heading}>{chart}</div>;
  }

  return (
    <section
      aria-labelledby="skill-radar-chart-title"
      className="rounded-2xl border border-satin bg-surface-raised p-6"
    >
      {chart}
    </section>
  );
});
