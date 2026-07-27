import { BadgeCheck } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { WeightStatus } from '../types/rubric.types';
import { MAX_SCORE_TARGET } from '../utils/rubricValidation';

interface RubricMaxScoreStatusProps {
  totalMaxScore: number;
  maxScoreStatus: WeightStatus;
}

export function RubricMaxScoreStatus({
  totalMaxScore,
  maxScoreStatus,
}: RubricMaxScoreStatusProps) {
  const { t } = useLanguage();

  const missing = Math.max(0, MAX_SCORE_TARGET - totalMaxScore);
  const over = Math.max(0, totalMaxScore - MAX_SCORE_TARGET);
  const isValid = maxScoreStatus === 'valid';
  const fillWidth = Math.min(100, Math.max(0, totalMaxScore));

  const message =
    maxScoreStatus === 'valid'
      ? t('rubrics.maxScore.valid')
      : maxScoreStatus === 'under'
        ? t('rubrics.maxScore.under').replace('{score}', String(missing))
        : t('rubrics.maxScore.over').replace('{score}', String(over));

  return (
    <section
      className="frame-satin rounded-xl border border-satin bg-surface-raised p-4 sm:p-5"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{t('rubrics.maxScore.title')}</p>
        <p
          className={cn(
            'text-sm font-semibold',
            isValid ? 'text-foreground' : 'text-error',
          )}
        >
          {totalMaxScore} / {MAX_SCORE_TARGET}
        </p>
      </div>

      <div className="relative mt-4">
        <div
          className="h-3 overflow-hidden rounded-full border border-satin bg-surface-overlay"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={MAX_SCORE_TARGET}
          aria-valuenow={totalMaxScore}
          aria-label={t('rubrics.maxScore.title')}
        >
          <div
            className={cn(
              'h-full rounded-full transition-[width,background-color] duration-300 ease-out',
              isValid ? 'bg-success' : 'bg-error',
            )}
            style={{ width: `${fillWidth}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-caption text-muted-foreground">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      <p
        className={cn(
          'mt-3 flex items-center gap-2 text-sm',
          isValid ? 'text-success' : 'text-error',
        )}
      >
        {isValid ? <BadgeCheck className="size-4 shrink-0" aria-hidden /> : null}
        {message}
      </p>
    </section>
  );
}
