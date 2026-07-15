import React from 'react';
import { cn } from '@/lib/utils';
import { ACTIVITY_LEVEL_CLASS, getActivityLevel } from '../../utils/interviewHeatmapUtils';
import type { HeatmapCell } from '../../utils/interviewHeatmapUtils';

interface InterviewHeatmapCellProps {
  cell: HeatmapCell;
  onSelect: (cell: HeatmapCell) => void;
  onHover: (cell: HeatmapCell | null, anchor: DOMRect | null) => void;
}

export const InterviewHeatmapCell: React.FC<InterviewHeatmapCellProps> = ({
  cell,
  onSelect,
  onHover,
}) => {
  const level = getActivityLevel(cell.count);

  return (
    <button
      type="button"
      disabled={!cell.inYear}
      onClick={() => cell.inYear && cell.count > 0 && onSelect(cell)}
      onMouseEnter={(event) => cell.inYear && onHover(cell, event.currentTarget.getBoundingClientRect())}
      onMouseLeave={() => onHover(null, null)}
      onFocus={(event) => cell.inYear && onHover(cell, event.currentTarget.getBoundingClientRect())}
      onBlur={() => onHover(null, null)}
      className={cn(
        'size-[11px] rounded-sm transition-transform duration-150 sm:size-3',
        cell.inYear ? ACTIVITY_LEVEL_CLASS[level] : 'bg-transparent',
        cell.inYear && cell.count > 0
          ? 'cursor-pointer hover:scale-110 hover:ring-2 hover:ring-[var(--border-focus)]'
          : 'cursor-default',
      )}
      aria-label={cell.inYear ? `${cell.date}: ${cell.count}` : undefined}
    />
  );
};
