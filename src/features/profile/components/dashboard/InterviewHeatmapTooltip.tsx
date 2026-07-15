import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { HeatmapCell } from '../../utils/interviewHeatmapUtils';

interface InterviewHeatmapTooltipProps {
  cell: HeatmapCell | null;
  anchor: DOMRect | null;
}

export const InterviewHeatmapTooltip: React.FC<InterviewHeatmapTooltipProps> = ({ cell, anchor }) => {
  const { t, language } = useLanguage();

  if (!cell || !anchor || cell.count === 0) return null;

  const formattedDate = new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${cell.date}T12:00:00`));

  return (
    <div
      className="pointer-events-none fixed z-50 min-w-[10rem] rounded-lg border border-subtle bg-surface-elevated px-3 py-2 text-xs shadow-lg"
      style={{
        top: anchor.top - 8,
        left: anchor.left + anchor.width / 2,
        transform: 'translate(-50%, -100%)',
      }}
      role="tooltip"
    >
      <p className="font-semibold text-foreground">{formattedDate}</p>
      <p className="mt-1 text-muted-foreground">
        {t('profile.dashboard.heatmapTooltipCount').replace('{count}', String(cell.count))}
      </p>
      {cell.avgScore > 0 ? (
        <p className="mt-0.5 text-muted-foreground">
          {t('profile.dashboard.heatmapTooltipScore').replace('{score}', String(cell.avgScore))}
        </p>
      ) : null}
    </div>
  );
};
