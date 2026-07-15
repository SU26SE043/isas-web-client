import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';

interface PracticeWizardNavProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backDisabled?: boolean;
  isLoading?: boolean;
}

export const PracticeWizardNav: React.FC<PracticeWizardNavProps> = ({
  onBack,
  onNext,
  nextLabel,
  nextDisabled = false,
  backDisabled = false,
  isLoading = false,
}) => {
  const { t } = useLanguage();

  return (
    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-satin pt-6">
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border border-satin bg-transparent px-4 py-2.5 text-sm font-medium text-foreground shadow-[var(--satin-inset)] transition-[background-color,border-color,opacity] duration-200 ease-out hover:border-[var(--satin-border-hover)] hover:bg-white/[0.04]',
          backDisabled ? 'cursor-not-allowed opacity-40' : null,
        )}
        disabled={backDisabled || !onBack}
        onClick={onBack}
      >
        <ChevronLeft className="size-4" aria-hidden />
        {t('practice.wizard.back')}
      </button>
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-[background-color,border-color,opacity] duration-200 ease-out',
          nextDisabled || isLoading
            ? 'frame-satin cursor-not-allowed bg-white/[0.04] text-muted-foreground opacity-70'
            : 'btn-primary',
        )}
        disabled={nextDisabled || isLoading}
        onClick={onNext}
      >
        {isLoading ? t('practice.wizard.loading') : (nextLabel ?? t('practice.wizard.next'))}
        {!isLoading ? <ChevronRight className="size-4" aria-hidden /> : null}
      </button>
    </div>
  );
};
