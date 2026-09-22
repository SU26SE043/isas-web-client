import { ClipboardCheck, Loader2, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLanguage } from '@/shared/languages';
import type { EditableRubricCriterion } from '@/features/rubrics/types/rubric.types';
import { RubricCriteriaTable } from '@/features/rubrics/components/RubricCriteriaTable';
import type { PracticeJobCategory } from '../../types/b2cPracticeSession.types';
import type { PracticeRubricCriterion } from '../../types/practiceSetup.types';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

interface PracticeGradingCriteriaStepProps {
  jobCategory: PracticeJobCategory | null;
  criteria: PracticeRubricCriterion[];
  selectedIds: string[];
  isLoading: boolean;
  isError: boolean;
  disabled?: boolean;
  onSelect: (ids: string[]) => void;
  onRetry: () => void;
  onBack: () => void;
  onBackToDomain?: () => void;
  onNext: () => void;
}

export function PracticeGradingCriteriaStep({
  jobCategory,
  criteria,
  selectedIds,
  isLoading,
  isError,
  disabled,
  onSelect,
  onRetry,
  onBack,
  onBackToDomain,
  onNext,
}: PracticeGradingCriteriaStepProps) {
  const { t } = useLanguage();
  const [showValidation, setShowValidation] = useState(false);
  const validCriteria = criteria.filter((criterion) => criterion.id && criterion.name.trim());
  const tableCriteria = useMemo<EditableRubricCriterion[]>(
    () => validCriteria.map((criterion) => ({
      clientId: criterion.id,
      serverId: criterion.id,
      name: criterion.name,
      description: criterion.description,
      weightPercent: criterion.weight,
      maxScore: criterion.maxScore,
    })),
    [validCriteria],
  );
  const canNext = Boolean(jobCategory) && !isLoading && !isError && validCriteria.length > 0 && selectedIds.length > 0;

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
      {jobCategory ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-satin bg-surface-overlay/60 px-4 py-3">
          <span className="text-sm font-medium text-muted-foreground">
            {t('practice.setup.gradingCriteria.domainLabel')}
          </span>
          <span className="rounded-full border border-satin bg-surface-raised px-3 py-1 text-sm font-semibold text-foreground">
            {t(`rubrics.domain.${jobCategory}`)}
          </span>
        </div>
      ) : null}

      {!jobCategory ? (
        <div className="rounded-xl border border-dashed border-satin bg-surface-overlay/50 p-5 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {t('practice.setup.gradingCriteria.noDomain')}
          </p>
          {onBackToDomain ? (
            <button type="button" className="btn-secondary mt-4" onClick={onBackToDomain}>
              {t('practice.setup.gradingCriteria.backToDomain')}
            </button>
          ) : null}
        </div>
      ) : isLoading ? (
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
        <div className="rounded-xl border border-dashed border-satin bg-surface-overlay/50 p-5 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {t('practice.setup.gradingCriteria.empty')}
          </p>
        </div>
      ) : (
        <RubricCriteriaTable
          mode="select"
          criteria={tableCriteria}
          selectedIds={selectedIds}
          disabled={disabled}
          onSelectionChange={(ids) => {
            setShowValidation(false);
            onSelect(ids);
          }}
        />
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
