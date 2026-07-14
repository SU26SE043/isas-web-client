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
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-6">
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border border-white/12 bg-transparent px-4 py-2.5 text-sm font-medium text-foreground transition-[background-color,border-color,opacity] duration-200 ease-out hover:bg-white/[0.04]',
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
        className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5"
        disabled={nextDisabled || isLoading}
        onClick={onNext}
      >
        {isLoading ? t('practice.wizard.loading') : (nextLabel ?? t('practice.wizard.next'))}
        {!isLoading ? <ChevronRight className="size-4" aria-hidden /> : null}
      </button>
    </div>
  );
};
