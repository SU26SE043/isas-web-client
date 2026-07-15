import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { buildHeatmapWeeks, getMonthLabels } from '../../utils/interviewHeatmapUtils';
import type { HeatmapCell } from '../../utils/interviewHeatmapUtils';
import type { InterviewHistoryItem } from '@/features/practice/types/history.types';
import { InterviewHeatmapCell } from './InterviewHeatmapCell';
import { InterviewHeatmapLegend } from './InterviewHeatmapLegend';
import { InterviewHeatmapTooltip } from './InterviewHeatmapTooltip';

interface InterviewHeatmapGridProps {
  interviews: InterviewHistoryItem[];
  year: number;
}

export const InterviewHeatmapGrid: React.FC<InterviewHeatmapGridProps> = ({ interviews, year }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<DOMRect | null>(null);

  const weeks = useMemo(() => buildHeatmapWeeks(year, interviews), [interviews, year]);
  const monthLabels = useMemo(() => getMonthLabels(year, weeks.length), [year, weeks.length]);

  const handleSelect = (cell: HeatmapCell) => {
    navigate(`/candidate/practice/history?date=${cell.date}`);
  };

  const handleHover = (cell: HeatmapCell | null, anchor: DOMRect | null) => {
    setHoveredCell(cell);
    setTooltipAnchor(anchor);
  };

  return (
    <div className="relative">
      <InterviewHeatmapTooltip cell={hoveredCell} anchor={tooltipAnchor} />
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex min-w-full flex-col gap-2">
          <div className="flex gap-1 pl-7 text-[10px] text-muted-foreground sm:pl-8 sm:text-xs">
            {weeks.map((_, weekIndex) => {
              const month = monthLabels.find((item) => item.column === weekIndex);
              return (
                <div key={weekIndex} className="w-[11px] shrink-0 sm:w-3">
                  {month ? <span className="whitespace-nowrap">{month.label}</span> : null}
                </div>
              );
            })}
          </div>

          <div className="flex gap-1">
            <div className="grid w-6 shrink-0 grid-rows-7 gap-1 text-[10px] leading-none text-muted-foreground sm:w-7 sm:text-xs">
              {[0, 1, 2, 3, 4, 5, 6].map((row) => (
                <span key={row} className="flex h-3 items-center">
                  {row === 1
                    ? t('profile.dashboard.heatmapWeekday.mon')
                    : row === 3
                      ? t('profile.dashboard.heatmapWeekday.wed')
                      : row === 5
                        ? t('profile.dashboard.heatmapWeekday.fri')
                        : null}
                </span>
              ))}
            </div>

            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((cell, dayIndex) => (
                    <InterviewHeatmapCell
                      key={`${weekIndex}-${dayIndex}`}
                      cell={cell}
                      onSelect={handleSelect}
                      onHover={handleHover}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <InterviewHeatmapLegend />
      </div>
    </div>
  );
};
