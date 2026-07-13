import React from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { PracticeRubricCriterion } from '../../types/practiceSetup.types';
import { PracticeWizardNav } from './PracticeWizardNav';

interface PracticeRubricStepProps {
  rubric: PracticeRubricCriterion[];
  isLoading: boolean;
  onChange: (rubric: PracticeRubricCriterion[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export const PracticeRubricStep: React.FC<PracticeRubricStepProps> = ({
  rubric,
  isLoading,
  onChange,
  onBack,
  onNext,
}) => {
  const { t } = useLanguage();
  const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight), 0);
  const weightValid = totalWeight === 100;

  const updateCriterion = (index: number, patch: Partial<PracticeRubricCriterion>) => {
    onChange(rubric.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-subtle bg-surface-raised">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-subtle bg-surface-raised p-6">
      <h2 className="heading-secondary text-lg">{t('practice.wizard.rubric.title')}</h2>
      <p className="body-text mt-1 text-sm">{t('practice.wizard.rubric.description')}</p>

      <div className="mt-5 space-y-4">
        {rubric.map((criterion, index) => (
          <div key={criterion.id} className="rounded-lg border border-subtle bg-surface-overlay p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_96px]">
              <div>
                <Label htmlFor={`rubric-name-${criterion.id}`}>{t('practice.wizard.rubric.name')}</Label>
                <Input
                  id={`rubric-name-${criterion.id}`}
                  value={criterion.name}
                  onChange={(event) => updateCriterion(index, { name: event.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={`rubric-weight-${criterion.id}`}>{t('practice.wizard.rubric.weight')}</Label>
                <Input
                  id={`rubric-weight-${criterion.id}`}
                  type="number"
                  min={0}
                  max={100}
                  value={criterion.weight}
                  onChange={(event) => updateCriterion(index, { weight: Number(event.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-3">
              <Label htmlFor={`rubric-desc-${criterion.id}`}>{t('practice.wizard.rubric.criterionDesc')}</Label>
              <Input
                id={`rubric-desc-${criterion.id}`}
                value={criterion.description}
                onChange={(event) => updateCriterion(index, { description: event.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        ))}
      </div>

      <p className={`mt-4 text-sm ${weightValid ? 'text-muted-foreground' : 'text-warning'}`}>
        {t('practice.wizard.rubric.weightTotal').replace('{total}', String(totalWeight))}
      </p>

      <PracticeWizardNav
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!weightValid || rubric.length === 0}
      />
    </section>
  );
};
