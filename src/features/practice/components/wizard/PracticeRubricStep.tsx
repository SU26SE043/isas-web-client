import React, { useState } from 'react';
import { CheckCircle2, ClipboardList, PieChart } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { PracticeRubricCriterion } from '../../types/practiceSetup.types';
import { PracticeRubricCriterionCard } from './PracticeRubricCriterionCard';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight), 0);
  const weightValid = totalWeight === 100;

  const updateCriterion = (index: number, patch: Partial<PracticeRubricCriterion>) => {
    onChange(rubric.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  return (
    <PracticeWizardStepCard
      icon={<ClipboardList className="size-4" aria-hidden />}
      title={t('practice.wizard.rubric.title')}
      description={t('practice.wizard.rubric.description')}
      isLoading={isLoading}
      footer={
        <PracticeWizardNav
          onBack={onBack}
          onNext={onNext}
          nextDisabled={!weightValid || rubric.length === 0}
        />
      }
    >
      <div className="space-y-3">
        {rubric.map((criterion, index) => (
          <PracticeRubricCriterionCard
            key={criterion.id}
            criterion={criterion}
            index={index}
            isEditing={editingId === criterion.id}
            onToggleEdit={() =>
              setEditingId((current) => (current === criterion.id ? null : criterion.id))
            }
            onChange={(patch) => updateCriterion(index, patch)}
          />
        ))}
      </div>

      <div
        className={cn(
          'mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3',
          weightValid
            ? 'border-white/12 bg-white/[0.04]'
            : 'border-warning/30 bg-warning/5',
        )}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <PieChart className="size-4 text-muted-foreground" aria-hidden />
          {t('practice.wizard.rubric.totalLabel').replace('{total}', String(totalWeight))}
        </div>
        <div
          className={cn(
            'flex items-center gap-2 text-sm',
            weightValid ? 'text-success' : 'text-warning',
          )}
        >
          {weightValid ? <CheckCircle2 className="size-4 shrink-0" aria-hidden /> : null}
          <span>{t('practice.wizard.rubric.mustEqual100')}</span>
        </div>
      </div>
    </PracticeWizardStepCard>
  );
};
