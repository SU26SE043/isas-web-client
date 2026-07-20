import { Clock } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { PracticeTimeLimitSec } from '../../types/b2cPracticeSession.types';
import { PRACTICE_TIME_LIMIT_OPTIONS } from '../../types/b2cPracticeSession.types';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardOptionCard } from './PracticeWizardOptionCard';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

interface PracticeTimeLimitStepProps {
  value: PracticeTimeLimitSec;
  disabled?: boolean;
  onSelect: (value: PracticeTimeLimitSec) => void;
  onBack: () => void;
  onNext: () => void;
}

const LABEL_KEYS: Record<PracticeTimeLimitSec, string> = {
  60: 'practice.setup.timeLimit.60',
  120: 'practice.setup.timeLimit.120',
  240: 'practice.setup.timeLimit.240',
};

export function PracticeTimeLimitStep({
  value,
  disabled,
  onSelect,
  onBack,
  onNext,
}: PracticeTimeLimitStepProps) {
  const { t } = useLanguage();

  return (
    <PracticeWizardStepCard
      icon={<Clock className="size-4" aria-hidden />}
      title={t('practice.setup.timeLimit.title')}
      description={t('practice.setup.timeLimit.description')}
      footer={<PracticeWizardNav onBack={onBack} onNext={onNext} nextDisabled={disabled} />}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {PRACTICE_TIME_LIMIT_OPTIONS.map((option) => (
          <PracticeWizardOptionCard
            key={option}
            title={t(LABEL_KEYS[option])}
            selected={value === option}
            onClick={() => onSelect(option)}
            disabled={disabled}
          />
        ))}
      </div>
    </PracticeWizardStepCard>
  );
}
