import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FlowWizardNavProps {
  backLabel: string;
  nextLabel: string;
  loadingLabel?: string;
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  backDisabled?: boolean;
  isLoading?: boolean;
}

export function FlowWizardNav({
  backLabel,
  nextLabel,
  loadingLabel,
  onBack,
  onNext,
  nextDisabled = false,
  backDisabled = false,
  isLoading = false,
}: FlowWizardNavProps) {
  return (
    <div className="mt-auto flex flex-col-reverse gap-3 border-t border-satin pt-6 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        className={cn(
          'btn-secondary inline-flex items-center justify-center gap-2 sm:min-w-[7.5rem]',
          backDisabled || !onBack ? 'cursor-not-allowed opacity-50' : null,
        )}
        disabled={backDisabled || !onBack}
        onClick={onBack}
      >
        <ChevronLeft className="size-4" aria-hidden />
        {backLabel}
      </button>
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-[background-color,border-color,opacity] duration-200 ease-out sm:min-w-[7.5rem]',
          nextDisabled || isLoading
            ? 'frame-satin cursor-not-allowed bg-white/[0.04] text-muted-foreground opacity-70'
            : 'btn-primary',
        )}
        disabled={nextDisabled || isLoading}
        onClick={onNext}
      >
        {isLoading ? (loadingLabel ?? nextLabel) : nextLabel}
        {!isLoading ? <ChevronRight className="size-4" aria-hidden /> : null}
      </button>
    </div>
  );
}
