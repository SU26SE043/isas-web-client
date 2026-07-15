import React from 'react';
import { cn } from '@/lib/utils';

interface PracticeRubricWeightRingProps {
  weight: number;
  label: string;
  className?: string;
}

export const PracticeRubricWeightRing: React.FC<PracticeRubricWeightRingProps> = ({
  weight,
  label,
  className,
}) => {
  const clamped = Math.max(0, Math.min(100, Number(weight) || 0));
  const circumference = 2 * Math.PI * 18;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="relative size-12" aria-hidden>
        <svg viewBox="0 0 44 44" className="size-12 -rotate-90">
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-white/10"
          />
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-foreground transition-[stroke-dashoffset] duration-300 ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
          {clamped}%
        </span>
      </div>
    </div>
  );
};
