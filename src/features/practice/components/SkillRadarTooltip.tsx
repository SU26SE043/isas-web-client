import { memo } from 'react';
import { CHART_RADAR } from '@/shared/charts/chartColors';
import type { Language } from '../../../shared/languages';
import type { RadarData } from '../types/result.types';

interface TooltipPayloadItem {
  payload?: RadarData;
  value?: number;
  name?: string;
  color?: string;
}

export interface CustomTooltipProps {
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

export const CustomTooltip = memo(function CustomTooltip({
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
