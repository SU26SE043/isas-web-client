import { Check, ClipboardCheck, Loader2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/shared/languages';
import type { PracticeRubricCriterion } from '../../types/practiceSetup.types';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

interface PracticeGradingCriteriaStepProps {
  criteria: PracticeRubricCriterion[];
  selectedIds: string[];
  isLoading: boolean;
  isError: boolean;
  disabled?: boolean;
  onSelect: (ids: string[]) => void;
  onRetry: () => void;
  onBack: () => void;
  onNext: () => void;
}

export function PracticeGradingCriteriaStep({
  criteria,
  selectedIds,
  isLoading,
  isError,
  disabled,
  onSelect,
  onRetry,
  onBack,
  onNext,
}: PracticeGradingCriteriaStepProps) {
  const { t } = useLanguage();
  const [showValidation, setShowValidation] = useState(false);
  const selectedSet = new Set(selectedIds);
  const validCriteria = criteria.filter((criterion) => criterion.id && criterion.name.trim());
  const canNext = !isLoading && !isError && validCriteria.length > 0 && selectedIds.length > 0;

  const handleToggle = (id: string) => {
    setShowValidation(false);
    onSelect(selectedSet.has(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);
  };

  const handleNext = () => {
    if (!canNext) {
      setShowValidation(true);
      return;
    }
    onNext();
  };

  return (
    <PracticeWizardStepCard
      icon={<ClipboardCheck className="size-4" aria-hidden />}
      title={t('practice.setup.gradingCriteria.title')}
      description={t('practice.setup.gradingCriteria.description')}
      footer={
        <PracticeWizardNav
          onBack={onBack}
          onNext={handleNext}
          nextDisabled={Boolean(disabled || isLoading || isError || validCriteria.length === 0)}
          backDisabled={disabled}
        />
      }
    >
      {isLoading ? (
        <div className="space-y-3" aria-label={t('practice.setup.gradingCriteria.loading')}>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl border border-satin bg-surface-overlay" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-error/30 bg-error/10 p-5 text-center">
          <p className="text-sm font-medium text-error">{t('practice.setup.gradingCriteria.loadError')}</p>
          <button type="button" className="btn-secondary mt-4 inline-flex items-center gap-2" onClick={onRetry}>
            <RefreshCw className="size-4" aria-hidden />
            {t('practice.setup.gradingCriteria.retry')}
          </button>
        </div>
      ) : validCriteria.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-satin p-5 text-center text-sm font-medium text-muted-foreground">
          {t('practice.setup.gradingCriteria.empty')}
        </p>
      ) : (
        <div className="space-y-3">
          {validCriteria.map((criterion) => {
            const selected = selectedSet.has(criterion.id);
            return (
              <label
                key={criterion.id}
                className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-[border-color,background-color,box-shadow] ${
                  selected
                    ? 'border-info/70 bg-info/10 shadow-[0_0_18px_-10px_var(--color-info)]'
                    : 'border-satin bg-surface-overlay/70 hover:border-info/40 hover:bg-info/5'
                } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selected}
                  disabled={disabled}
                  onChange={() => handleToggle(criterion.id)}
                />
                <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border ${selected ? 'border-info bg-info text-white' : 'border-satin bg-surface-base text-transparent'}`}>
                  <Check className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-foreground">{criterion.name}</span>
                    <span className="rounded-full border border-info/25 bg-info/10 px-2.5 py-1 text-xs font-semibold text-info-light">
                      {criterion.weight}%
                    </span>
                  </span>
                  {criterion.description ? (
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">{criterion.description}</span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {showValidation ? (
        <p className="mt-4 text-sm font-medium text-error" role="alert">
          {t('practice.setup.gradingCriteria.validation.required')}
        </p>
      ) : null}

      {!isLoading && !isError && validCriteria.length > 0 ? (
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5" aria-hidden />
          {t('practice.setup.gradingCriteria.selectedCount').replace('{count}', String(selectedIds.length))}
        </p>
      ) : null}
    </PracticeWizardStepCard>
  );
}
