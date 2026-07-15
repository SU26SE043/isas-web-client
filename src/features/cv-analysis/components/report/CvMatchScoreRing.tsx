import React from 'react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import { CV_CHART_COLORS, scoreToneClass, scoreToneColor } from '../../utils/cvChartColors';

interface CvMatchScoreRingProps {
  score: number;
  className?: string;
}

/** Circular match-score chart with semantic stroke color by score band. */
export const CvMatchScoreRing: React.FC<CvMatchScoreRingProps> = ({ score, className }) => {
  const { t } = useLanguage();
  const clamped = Math.min(Math.max(score, 0), 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const stroke = scoreToneColor(clamped);

  return (
    <div
      className={cn('relative flex size-24 shrink-0 items-center justify-center', className)}
      aria-label={`${t('result.match')}: ${clamped}%`}
    >
      <svg className="size-24 -rotate-90" viewBox="0 0 96 96" aria-hidden>
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={CV_CHART_COLORS.matchTrack}
          strokeWidth="8"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className={cn('text-2xl font-bold', scoreToneClass(clamped))}>{clamped}</p>
        <p className="text-caption text-muted-foreground">/100</p>
      </div>
    </div>
  );
};
