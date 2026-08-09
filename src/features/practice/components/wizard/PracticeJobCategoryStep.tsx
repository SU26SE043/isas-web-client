import { CareerPositionSelector } from '@/components/patterns/flow-wizard/CareerPositionSelector';
import {
  careerPositionToJobCategoryEnum,
  jobCategoryEnumToDomainId,
} from '@/shared/domain/careerPositions';
import type { JobDomainId } from '@/shared/domain/jobDomains';
import { useLanguage } from '@/shared/languages';
import type { PracticeJobCategory } from '../../types/b2cPracticeSession.types';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

interface PracticeJobCategoryStepProps {
  value: PracticeJobCategory | null;
  onSelect: (value: PracticeJobCategory) => void;
  onNext: () => void;
  onBack: () => void;
  disabled?: boolean;
}

export function PracticeJobCategoryStep({
  value,
  onSelect,
  onNext,
  onBack,
  disabled,
}: PracticeJobCategoryStepProps) {
  const { t } = useLanguage();
  const selectedId = value ? jobCategoryEnumToDomainId(value) : null;

  const handleSelect = (domainId: JobDomainId) => {
    onSelect(careerPositionToJobCategoryEnum(domainId));
  };

  return (
    <PracticeWizardStepCard
      title={t('practice.setup.jobCategory.title')}
      className="min-h-[calc(100dvh-3rem)]"
      footer={
        <PracticeWizardNav
          onBack={onBack}
          onNext={onNext}
          nextDisabled={!value || disabled}
        />
      }
    >
      <CareerPositionSelector
        selectedId={selectedId}
        onSelect={handleSelect}
        accent="blue"
        ariaLabel={t('practice.setup.jobCategory.groupLabel')}
        disabled={disabled}
      />
    </PracticeWizardStepCard>
  );
}
