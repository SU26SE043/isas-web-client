import React from 'react';
import { Award, Briefcase, Sparkles, Target } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { practiceLevelI18nKey } from '@/shared/domain/practiceLevels';
import type { PracticeLevel } from '../../types/practiceSetup.types';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardOptionCard } from './PracticeWizardOptionCard';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

const LEVEL_ICONS: Record<PracticeLevel, React.ReactNode> = {
  Fresher: <Sparkles className="size-4" aria-hidden />,
  Junior: <Briefcase className="size-4" aria-hidden />,
  Middle: <Target className="size-4" aria-hidden />,
  Senior: <Award className="size-4" aria-hidden />,
};

interface PracticeLevelStepProps {
  levels: PracticeLevel[];
  selectedLevel: PracticeLevel | '';
  onSelect: (level: PracticeLevel) => void;
  onBack: () => void;
  onNext: () => void;
}

export const PracticeLevelStep: React.FC<PracticeLevelStepProps> = ({
  levels,
  selectedLevel,
  onSelect,
  onBack,
  onNext,
}) => {
  const { t } = useLanguage();

  return (
    <PracticeWizardStepCard
      icon={<Award className="size-4" aria-hidden />}
      title={t('practice.wizard.level.title')}
      description={t('practice.wizard.level.description')}
      footer={<PracticeWizardNav onBack={onBack} onNext={onNext} nextDisabled={!selectedLevel} />}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {levels.map((level) => {
          const levelKey = practiceLevelI18nKey(level);
          return (
          <PracticeWizardOptionCard
            key={level}
            title={t(`practice.wizard.level.${levelKey}`)}
            description={t(`practice.wizard.level.${levelKey}.desc`)}
            icon={LEVEL_ICONS[level]}
            selected={level === selectedLevel}
            onClick={() => onSelect(level)}
          />
          );
        })}
      </div>
    </PracticeWizardStepCard>
  );
};
