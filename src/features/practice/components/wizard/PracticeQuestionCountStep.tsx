import React from 'react';
import { Hash, ListOrdered } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { PRACTICE_QUESTION_COUNTS } from '../../mocks/practiceSetup.fixtures';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardOptionCard } from './PracticeWizardOptionCard';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

interface PracticeQuestionCountStepProps {
  selectedCount: number;
  onSelect: (count: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export const PracticeQuestionCountStep: React.FC<PracticeQuestionCountStepProps> = ({
  selectedCount,
  onSelect,
  onBack,
  onNext,
}) => {
  const { t } = useLanguage();

  return (
    <PracticeWizardStepCard
      icon={<ListOrdered className="size-4" aria-hidden />}
      title={t('practice.wizard.questions.title')}
      description={t('practice.wizard.questions.description')}
      footer={<PracticeWizardNav onBack={onBack} onNext={onNext} />}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {PRACTICE_QUESTION_COUNTS.map((count) => (
          <PracticeWizardOptionCard
            key={count}
            title={`${count} ${t('practice.wizard.questions.unit')}`}
            description={t(`practice.wizard.questions.desc.${count}`)}
            icon={<Hash className="size-4" aria-hidden />}
            selected={count === selectedCount}
            onClick={() => onSelect(count)}
          />
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {t('practice.wizard.questions.hint').replace('{count}', String(selectedCount))}
      </p>
    </PracticeWizardStepCard>
  );
};
