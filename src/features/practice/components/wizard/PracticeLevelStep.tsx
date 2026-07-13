import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { PracticeLevel } from '../../types/practiceSetup.types';
import { PracticeWizardNav } from './PracticeWizardNav';

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
    <section className="rounded-xl border border-subtle bg-surface-raised p-6">
      <h2 className="heading-secondary text-lg">{t('practice.wizard.level.title')}</h2>
      <p className="body-text mt-1 text-sm">{t('practice.wizard.level.description')}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {levels.map((level) => {
          const isSelected = level === selectedLevel;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onSelect(level)}
              className={[
                'rounded-xl border px-4 py-3 text-left font-medium transition',
                isSelected
                  ? 'border-default bg-surface-elevated text-foreground'
                  : 'border-subtle bg-surface-overlay text-foreground hover:border-default',
              ].join(' ')}
              aria-pressed={isSelected}
            >
              {t(`practice.wizard.level.${level}`)}
            </button>
          );
        })}
      </div>

      <PracticeWizardNav
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!selectedLevel}
      />
    </section>
  );
};
