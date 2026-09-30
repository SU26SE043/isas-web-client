import { BadgeCheck } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { WeightStatus } from '../types/rubric.types';

interface RubricWeightStatusProps {
  totalWeight: number;
  totalWeightLabel: string;
  weightStatus: WeightStatus;
  serverError?: string | null;
}

export function RubricWeightStatus({
  totalWeight,
  totalWeightLabel,
  weightStatus,
  serverError,
}: RubricWeightStatusProps) {
  const { t } = useLanguage();

  const currentPercent = totalWeight * 100;
  const isValid = weightStatus === 'valid' && !serverError;
  const statusTone = serverError ? 'text-error' : isValid ? 'text-success' : 'text-foreground';

  const message = serverError ??
    (weightStatus === 'valid'
      ? t('rubrics.weight.valid')
      : t('rubrics.weight.adjusting').replace('{percent}', totalWeightLabel));

  const fillWidth = Math.min(100, Math.max(0, currentPercent));

  return (
    <section
      className="frame-satin rounded-xl border border-satin bg-surface-raised p-4 sm:p-5"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{t('rubrics.weight.title')}</p>
        <p
          className={cn(
            'text-sm font-semibold',
            statusTone,
          )}
        >
          {totalWeightLabel}
        </p>
      </div>

      <div className="relative mt-4">
        <div
          className="h-3 overflow-hidden rounded-full border border-satin bg-surface-overlay"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(currentPercent)}
          aria-label={t('rubrics.weight.title')}
        >
          <div
            className={cn(
              'h-full rounded-full transition-[width,background-color] duration-300 ease-out',
              serverError ? 'bg-error' : isValid ? 'bg-success' : 'bg-secondary-main',
            )}
            style={{ width: `${fillWidth}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-caption text-muted-foreground">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <p
        className={cn(
          'mt-3 flex items-center gap-2 text-sm',
          statusTone,
        )}
      >
        {isValid ? <BadgeCheck className="size-4 shrink-0" aria-hidden /> : null}
        {message}
      </p>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t('rubrics.weight.scoringNote')}</p>
    </section>
  );
}
