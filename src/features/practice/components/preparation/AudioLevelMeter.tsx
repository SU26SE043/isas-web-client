import { cn } from '@/lib/utils';

interface AudioLevelMeterProps {
  level: number;
  label: string;
}

export function AudioLevelMeter({ level, label }: AudioLevelMeterProps) {
  const bars = 12;
  const activeBars = Math.round(level * bars);

  return (
    <div className="space-y-2" aria-label={label}>
      <div className="flex h-8 items-end gap-1" role="meter" aria-valuenow={Math.round(level * 100)} aria-valuemin={0} aria-valuemax={100}>
        {Array.from({ length: bars }, (_, index) => (
          <span
            key={index}
            className={cn(
              'w-2 rounded-sm transition-[height,background-color] duration-100',
              index < activeBars ? 'bg-success' : 'bg-white/10',
            )}
            style={{ height: `${((index + 1) / bars) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
