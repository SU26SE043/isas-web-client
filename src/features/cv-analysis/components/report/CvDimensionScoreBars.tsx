import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { CvDimensionScore } from '../../types/cvAnalysis.types';
import { CV_CHART_COLORS } from '../../utils/cvChartColors';
import { CvFlowSectionCard } from '../flow/CvFlowSectionCard';

interface CvDimensionScoreBarsProps {
  dimensions: CvDimensionScore[];
}

export const CvDimensionScoreBars: React.FC<CvDimensionScoreBarsProps> = ({ dimensions }) => {
  const { language, t } = useLanguage();

  return (
    <CvFlowSectionCard title={t('result.dimensionScores')} description={t('result.dimensionScoresDesc')}>
      <ul className="space-y-4">
        {dimensions.map((dim, index) => {
          const label = language === 'vi' ? dim.labelVi : dim.labelEn;
          const color = CV_CHART_COLORS.barTracks[index % CV_CHART_COLORS.barTracks.length];
          const width = `${Math.min(Math.max(dim.score, 0), 100)}%`;

          return (
            <li key={dim.id}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">{label}</span>
                <span className="tabular-nums font-semibold text-foreground">{dim.score}%</span>
              </div>
              <div
                className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]"
                role="meter"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={dim.score}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-300 ease-out"
                  style={{ width, backgroundColor: color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </CvFlowSectionCard>
  );
};
