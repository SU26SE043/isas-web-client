import React from 'react';
import { useLanguage } from '@/shared/languages';
import {
  ROADMAP_TARGET_LEVELS,
  type RoadmapTargetLevel,
} from '../../mocks/practiceSetup.fixtures';
import { RoadmapWizardNav } from './RoadmapWizardNav';

interface RoadmapTargetLevelStepProps {
  selectedLevel: RoadmapTargetLevel | '';
  onSelect: (level: RoadmapTargetLevel) => void;
  onBack: () => void;
  onNext: () => void;
}

export const RoadmapTargetLevelStep: React.FC<RoadmapTargetLevelStepProps> = ({
  selectedLevel,
  onSelect,
  onBack,
  onNext,
}) => {
  const { t } = useLanguage();

  return (
    <section className="rounded-xl border border-subtle bg-surface-raised p-6">
      <h2 className="heading-secondary text-lg">{t('practice.roadmapWizard.level.title')}</h2>
      <p className="body-text mt-1 text-sm">{t('practice.roadmapWizard.level.description')}</p>

      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        {ROADMAP_TARGET_LEVELS.map((level) => {
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
              {t(`practice.roadmapWizard.level.${level}`)}
            </button>
          );
        })}
      </div>

      <RoadmapWizardNav onBack={onBack} onNext={onNext} nextDisabled={!selectedLevel} />
    </section>
  );
};
