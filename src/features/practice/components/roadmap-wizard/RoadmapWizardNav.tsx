import React from 'react';
import { useLanguage } from '@/shared/languages';

interface RoadmapWizardNavProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backDisabled?: boolean;
  isLoading?: boolean;
}

export const RoadmapWizardNav: React.FC<RoadmapWizardNavProps> = ({
  onBack,
  onNext,
  nextLabel,
  nextDisabled = false,
  backDisabled = false,
  isLoading = false,
}) => {
  const { t } = useLanguage();

  return (
    <div className="mt-auto flex flex-wrap justify-between gap-3 border-t border-satin pt-6">
      <button type="button" className="btn-secondary" disabled={backDisabled} onClick={onBack}>
        {t('practice.roadmapWizard.back')}
      </button>
      <button
        type="button"
        className="btn-primary"
        disabled={nextDisabled || isLoading}
        onClick={onNext}
      >
        {isLoading ? t('practice.roadmapWizard.loading') : (nextLabel ?? t('practice.roadmapWizard.next'))}
      </button>
    </div>
  );
};
