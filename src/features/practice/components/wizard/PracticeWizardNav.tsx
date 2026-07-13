import React from 'react';
import { useLanguage } from '@/shared/languages';

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
    <div className="mt-6 flex flex-wrap justify-between gap-3">
      <button type="button" className="btn-secondary" disabled={backDisabled} onClick={onBack}>
        {t('practice.wizard.back')}
      </button>
      <button
        type="button"
        className="btn-primary"
        disabled={nextDisabled || isLoading}
        onClick={onNext}
      >
        {isLoading ? t('practice.wizard.loading') : (nextLabel ?? t('practice.wizard.next'))}
      </button>
    </div>
  );
};
