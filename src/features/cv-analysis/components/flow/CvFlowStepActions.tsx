import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';

interface CvFlowStepActionsProps {
  canNext: boolean;
  isBusy?: boolean;
  onBack?: () => void;
  onNext: () => void;
}

export function CvFlowStepActions({
  canNext,
  isBusy = false,
  onBack,
  onNext,
}: CvFlowStepActionsProps) {
  const { t } = useLanguage();

  return (
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
      {onBack ? (
        <button type="button" className="btn-secondary rounded-xl" onClick={onBack} disabled={isBusy}>
          {t('cv.back')}
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        className={cn(
          'inline-flex min-w-[7.5rem] items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-[background-color,border-color,opacity,transform] duration-200 ease-out',
          canNext
            ? 'btn-primary'
            : 'frame-satin cursor-not-allowed bg-white/[0.04] text-muted-foreground opacity-70',
        )}
        disabled={!canNext || isBusy}
        onClick={onNext}
      >
        {t('cv.next')}
      </button>
    </div>
  );
}
