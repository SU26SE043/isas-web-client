import { Briefcase, Code2, Layers, Server } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { PracticeJobCategory } from '../../types/b2cPracticeSession.types';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardOptionCard } from './PracticeWizardOptionCard';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

const OPTIONS: Array<{
  value: PracticeJobCategory;
  labelKey: string;
  icon: typeof Code2;
}> = [
  { value: 'FE', labelKey: 'practice.setup.jobCategory.FE', icon: Code2 },
  { value: 'BE', labelKey: 'practice.setup.jobCategory.BE', icon: Server },
  { value: 'BA', labelKey: 'practice.setup.jobCategory.BA', icon: Briefcase },
];

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

  return (
    <PracticeWizardStepCard
      icon={<Layers className="size-4" aria-hidden />}
      title={t('practice.setup.jobCategory.title')}
      description={t('practice.setup.jobCategory.description')}
      footer={
        <PracticeWizardNav
          onBack={onBack}
          onNext={onNext}
          nextDisabled={!value || disabled}
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <PracticeWizardOptionCard
              key={option.value}
              title={t(option.labelKey)}
              icon={<Icon className="size-5" aria-hidden />}
              selected={value === option.value}
              onClick={() => onSelect(option.value)}
              disabled={disabled}
            />
          );
        })}
      </div>
    </PracticeWizardStepCard>
  );
}
