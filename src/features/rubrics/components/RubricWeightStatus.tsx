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
  const missingToFull = Math.max(0, Math.round((100 - currentPercent) * 10) / 10);
  const overFull = Math.max(0, Math.round((currentPercent - 100) * 10) / 10);

  const message =
    serverError ??
    (weightStatus === 'valid'
      ? t('rubrics.weight.valid')
      : weightStatus === 'under'
        ? t('rubrics.weight.under').replace('{percent}', `${missingToFull}%`)
        : t('rubrics.weight.over').replace('{percent}', `${overFull}%`));

  const fillWidth = Math.min(100, currentPercent);

  return (
    <section
      className="frame-satin rounded-xl border border-satin bg-surface-raised p-4 sm:p-5"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{t('rubrics.weight.title')}</p>
        <p className="text-sm font-semibold text-foreground">{totalWeightLabel}</p>
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
              weightStatus === 'valid' && 'bg-success',
              weightStatus === 'under' && 'bg-warning',
              weightStatus === 'over' && 'bg-error',
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
          serverError ? 'text-error' : weightStatus === 'valid' ? 'text-success' : 'text-warning',
        )}
      >
        {weightStatus === 'valid' && !serverError ? (
          <BadgeCheck className="size-4 shrink-0" aria-hidden />
        ) : null}
        {message}
      </p>
    </section>
  );
}
