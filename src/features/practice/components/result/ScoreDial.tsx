import { memo } from 'react';

interface ScoreDialProps {
  score: number;
  label: string;
}

const scoreTone = (score: number) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-error';
};

export const ScoreDial = memo(function ScoreDial({ score, label }: ScoreDialProps) {
  const clamped = Math.min(Math.max(score, 0), 100);
  const rotation = (clamped / 100) * 270 - 135;

  return (
    <div className="flex flex-col items-center gap-3" aria-label={label}>
      <div className="relative flex h-36 w-36 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-[10px] border-surface-overlay"
          aria-hidden
        />
        <div
          className="absolute inset-0 rounded-full border-[10px] border-transparent border-t-foreground border-r-foreground"
          style={{ transform: `rotate(${rotation}deg)` }}
          aria-hidden
        />
        <div className="text-center">
          <p className={`heading-primary text-4xl ${scoreTone(clamped)}`}>{clamped}</p>
          <p className="text-xs font-medium text-muted-foreground">/100</p>
        </div>
      </div>
      <p className="text-sm font-semibold text-foreground">{label}</p>
    </div>
  );
});
