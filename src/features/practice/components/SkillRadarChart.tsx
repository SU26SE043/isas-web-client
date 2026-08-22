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
import { hasStartLayer, shouldFillThreshold } from './skillRadarSeries';

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
  startLabel?: string;
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
  showStart: boolean;
  yourScoreLabel: string;
  thresholdLabel: string;
  startLabel: string;
  noStartLabel: string;
  sampleLabel: string;
}

const CustomTooltip = memo(function CustomTooltip({
  active,
  payload,
  language,
  showThreshold,
  showStart,
  yourScoreLabel,
  thresholdLabel,
  startLabel,
  noStartLabel,
  sampleLabel,
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
        {showStart ? (
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ background: CHART_RADAR.startStroke }}
                aria-hidden
              />
              {startLabel}
            </span>
            {/*
              `C == null` ⇒ in ra "chưa có mốc", KHÔNG in "0%".
              Đây là chỗ dễ trượt nhất: một `?? 0` ở đây biến "chưa đo được" thành
              "khởi điểm 0%" và mọi tiêu chí đều trông như đã tiến bộ vượt bậc.
            */}
            <span className="font-semibold text-foreground">
              {item.C == null ? noStartLabel : `${item.C}%`}
            </span>
          </div>
        ) : null}
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
        {/*
          Các nan KHÔNG cùng cỡ mẫu: một tiêu chí dựa trên 1 buổi kém tin cậy hơn
          tiêu chí dựa trên 4 buổi, mà nhìn hình thì hai nan trông y hệt nhau.
        */}
        {item.recentCount ? (
          <p className="pt-1 text-xs text-muted-foreground">
            {sampleLabel.replace('{count}', String(item.recentCount))}
          </p>
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
  startLabel,
}: SkillRadarChartProps) {
  const { t } = useLanguage();
  const currentLabel = yourScoreLabel ?? t('practice.radar.current');
  const targetLabel = thresholdLabel ?? t('practice.radar.target');
  const startText = startLabel ?? t('practice.radar.start');
  const noStartText = t('practice.radar.noStart');
  const sampleText = t('practice.radar.sampleSize');
  const showStart = hasStartLayer(data);
  const fillThreshold = shouldFillThreshold(data);
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
                  showStart={showStart}
                  yourScoreLabel={currentLabel}
                  thresholdLabel={targetLabel}
                  startLabel={startText}
                  noStartLabel={noStartText}
                  sampleLabel={sampleText}
                />
              }
            />
            {/*
              THỨ TỰ VẼ CÓ Ý NGHĨA — recharts vẽ series sau đè lên series trước:
              1. "lúc bắt đầu" nằm dưới cùng, tô màu trung tính rất mờ;
              2. "gần đây" đè lên, tô màu nhấn — đây là thứ người đọc cần thấy rõ nhất;
              3. "ngưỡng" vẽ SAU CÙNG và KHÔNG tô, để đường nét đứt luôn nhìn thấy được
                 dù nó nằm trùng khít với một trong hai lớp kia (ngưỡng là hằng số theo
                 cấp độ nên nó luôn là đa giác đều nằm đè giữa hình).
            */}
            {showStart ? (
              <Radar
                name={startText}
                dataKey="C"
                stroke={CHART_RADAR.startStroke}
                fill={CHART_RADAR.startFill}
                fillOpacity={CHART_RADAR.startFillOpacity}
                strokeWidth={CHART_RADAR.startStrokeWidth}
                dot={{ r: 2, fill: CHART_RADAR.startStroke }}
                activeDot={{ r: 4 }}
              />
            ) : null}
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
                fill={fillThreshold ? CHART_RADAR.targetFill : 'none'}
                fillOpacity={fillThreshold ? CHART_RADAR.targetFillOpacity : 0}
                strokeWidth={CHART_RADAR.strokeWidth}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 5 }}
              />
            ) : null}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
        {showStart ? (
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full border"
              style={{
                background: CHART_RADAR.startFill,
                borderColor: CHART_RADAR.startStroke,
              }}
              aria-hidden
            />
            <span className="text-muted-foreground">{startText}</span>
          </div>
        ) : null}
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
            {/* Chú thích ngưỡng vẽ thành viền nét đứt KHÔNG tô, khớp với hình trên biểu đồ:
                chấm tròn đặc ở đây sẽ mô tả sai thứ người đọc đang nhìn. */}
            <span
              className="h-3 w-3 rounded-full border-2 border-dashed"
              style={{ borderColor: CHART_RADAR.targetStroke }}
              aria-hidden
            />
            <span className="text-muted-foreground">{targetLabel}</span>
          </div>
        ) : null}
      </div>
      {showStart ? (
        <p className="mt-2 text-xs text-muted-foreground">{t('practice.radar.startHint')}</p>
      ) : null}
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
