import { BadgeCheck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';

interface CampaignRubricTotalWeightProps {
  totalWeight: number;
  totalMaxScore: number;
  weightValid: boolean;
  maxScoreValid: boolean;
  resetDisabled?: boolean;
  onReset: () => void;
}

export function CampaignRubricTotalWeight({
  totalWeight,
  totalMaxScore,
  weightValid,
  maxScoreValid,
  resetDisabled = false,
  onReset,
}: CampaignRubricTotalWeightProps) {
  const { t } = useLanguage();
  const weightDisplay = Math.round(totalWeight * 10) / 10;

  return (
    <div className="flex flex-wrap gap-3 sm:justify-end">
      <div className="frame-satin min-w-[10rem] rounded-xl border border-satin bg-surface-raised/80 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-caption text-muted-foreground">
            {t('employer.campaigns.wizard.rubric.totalTitle')}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={resetDisabled}
            onClick={onReset}
            aria-label={t('employer.campaigns.wizard.rubric.reset')}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" aria-hidden />
          </Button>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <p
            className={cn(
              'text-2xl font-semibold tracking-tight',
              weightValid ? 'text-foreground' : 'text-error',
            )}
          >
            {weightDisplay}%
          </p>
          {weightValid ? <BadgeCheck className="size-5 text-success" aria-hidden /> : null}
        </div>
        <p className={cn('mt-1 text-xs', weightValid ? 'text-muted-foreground' : 'text-error')}>
          {t('employer.campaigns.wizard.rubric.mustEqual100')}
        </p>
      </div>

      <div
        className={cn(
          'frame-satin min-w-[10rem] rounded-xl border bg-surface-raised/80 px-4 py-3',
          maxScoreValid ? 'border-satin' : 'border-error/60',
        )}
      >
        <p className="text-caption text-muted-foreground">
          {t('employer.campaigns.wizard.rubric.totalMaxScore')}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <p
            className={cn(
              'text-2xl font-semibold tracking-tight',
              maxScoreValid ? 'text-foreground' : 'text-error',
            )}
          >
            {totalMaxScore}
          </p>
          {maxScoreValid ? <BadgeCheck className="size-5 text-success" aria-hidden /> : null}
        </div>
        <p className={cn('mt-1 text-xs', maxScoreValid ? 'text-muted-foreground' : 'text-error')}>
          {maxScoreValid
            ? t('employer.campaigns.wizard.rubric.totalMaxScoreHint')
            : t('employer.campaigns.wizard.rubric.maxScoreRangeHint')}
        </p>
      </div>
    </div>
  );
}
