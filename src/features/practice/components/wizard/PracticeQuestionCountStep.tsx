import React from 'react';
import { useLanguage } from '@/shared/languages';
import { PRACTICE_QUESTION_COUNTS } from '../../mocks/practiceSetup.fixtures';
import { PracticeWizardNav } from './PracticeWizardNav';

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
    <section className="rounded-xl border border-subtle bg-surface-raised p-6">
      <h2 className="heading-secondary text-lg">{t('practice.wizard.questions.title')}</h2>
      <p className="body-text mt-1 text-sm">{t('practice.wizard.questions.description')}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PRACTICE_QUESTION_COUNTS.map((count) => {
          const isSelected = count === selectedCount;
          return (
            <button
              key={count}
              type="button"
              onClick={() => onSelect(count)}
              className={[
                'rounded-xl border px-4 py-6 text-center transition',
                isSelected
                  ? 'border-default bg-surface-elevated'
                  : 'border-subtle bg-surface-overlay hover:border-default',
              ].join(' ')}
              aria-pressed={isSelected}
            >
              <span className="text-2xl font-semibold text-foreground">{count}</span>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('practice.wizard.questions.unit')}
              </p>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {t('practice.wizard.questions.hint').replace('{count}', String(selectedCount))}
      </p>

      <PracticeWizardNav onBack={onBack} onNext={onNext} />
    </section>
  );
};
