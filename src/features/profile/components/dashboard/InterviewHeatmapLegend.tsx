import React from 'react';
import { useLanguage } from '@/shared/languages';
import { ACTIVITY_LEVEL_CLASS } from '../../utils/interviewHeatmapUtils';

export const InterviewHeatmapLegend: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
      <span>{t('profile.dashboard.heatmapLess')}</span>
      <div className="flex items-center gap-1">
        {([0, 1, 2, 3] as const).map((level) => (
          <span
            key={level}
            className={`size-[11px] rounded-sm sm:size-3 ${ACTIVITY_LEVEL_CLASS[level]}`}
            aria-hidden
          />
        ))}
      </div>
      <span>{t('profile.dashboard.heatmapMore')}</span>
    </div>
  );
};
