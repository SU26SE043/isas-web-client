import { ChevronLeft, ChevronRight, ClipboardList, Info, Plus } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { PracticeRubricCriterion } from '../../types/practiceSetup.types';
import { PracticeRubricCriterionCard } from './PracticeRubricCriterionCard';
import { PracticeRubricTotalWeight } from './PracticeRubricTotalWeight';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

interface PracticeRubricStepProps {
  rubric: PracticeRubricCriterion[];
  contextLabel: string;
  isLoading: boolean;
  isSaving?: boolean;
  isResetting?: boolean;
  errorMessage?: string | null;
  onChange: (rubric: PracticeRubricCriterion[]) => void;
  onReset: () => void;
  onBack: () => void;
  onNext: () => void;
}

function createEmptyCriterion(): PracticeRubricCriterion {
  return {
    id: `new-${crypto.randomUUID().slice(0, 8)}`,
    name: '',
    description: '',
    weight: 0,
    maxScore: 10,
  };
}

export function PracticeRubricStep({
  rubric,
  contextLabel,
  isLoading,
  isSaving = false,
  isResetting = false,
  errorMessage,
  onChange,
  onReset,
  onBack,
  onNext,
}: PracticeRubricStepProps) {
  const { t } = useLanguage();
  const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  const totalMaxScore = rubric.reduce((sum, item) => sum + Number(item.maxScore || 0), 0);
  const weightValid = Math.round(totalWeight * 10) / 10 === 100;
  const maxScoreValid = totalMaxScore === 100;
  const hasEmptyName = rubric.some((item) => !item.name.trim());
  const hasInvalidMaxScore = rubric.some((item) => !Number.isFinite(item.maxScore) || item.maxScore < 1);
  const canNext =
    weightValid &&
    maxScoreValid &&
    rubric.length > 0 &&
    !hasEmptyName &&
    !hasInvalidMaxScore &&
    !isSaving &&
    !isResetting;
  const actionsDisabled = isSaving || isResetting;

  const updateCriterion = (index: number, patch: Partial<PracticeRubricCriterion>) => {
    onChange(rubric.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  return (
    <PracticeWizardStepCard
      icon={<ClipboardList className="size-4" aria-hidden />}
      title={t('practice.wizard.rubric.title')}
      description={t('practice.wizard.rubric.description')}
      isLoading={isLoading}
      headerAside={
        <PracticeRubricTotalWeight
          totalWeight={totalWeight}
          totalMaxScore={totalMaxScore}
          weightValid={weightValid}
          maxScoreValid={maxScoreValid}
          resetDisabled={actionsDisabled}
          isResetting={isResetting}
          onReset={onReset}
        />
      }
      footer={
        <div className="mt-auto flex flex-col gap-3 border-t border-satin pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-satin bg-transparent px-4 py-2.5 text-sm font-medium text-foreground shadow-[var(--satin-inset)] transition-[background-color,border-color] duration-200 ease-out hover:border-[var(--satin-border-hover)] hover:bg-white/[0.04]"
            onClick={onBack}
            disabled={actionsDisabled}
          >
            <ChevronLeft className="size-4" aria-hidden />
            {t('practice.wizard.back')}
          </button>

          <p className="flex items-start gap-2 text-center text-xs text-muted-foreground sm:max-w-sm sm:text-left">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>
              {t('practice.wizard.rubric.appliedTo').replace('{context}', contextLabel)}
            </span>
          </p>

          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-[background-color,opacity] duration-200 ease-out',
              canNext ? 'btn-primary' : 'frame-satin cursor-not-allowed bg-white/[0.04] text-muted-foreground opacity-70',
            )}
            disabled={!canNext}
            onClick={onNext}
          >
            {isSaving ? t('practice.wizard.rubric.saving') : t('practice.wizard.next')}
            {!isSaving ? <ChevronRight className="size-4" aria-hidden /> : null}
          </button>
        </div>
      }
    >
      <div className="mb-3 hidden grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_7.5rem_7rem_auto] gap-3 px-1 text-caption text-muted-foreground lg:grid">
        <span>{t('practice.wizard.rubric.colCriterion')}</span>
        <span>{t('practice.wizard.rubric.colDescription')}</span>
        <span>{t('practice.wizard.rubric.colWeight')}</span>
        <span>{t('practice.wizard.rubric.colMaxScore')}</span>
        <span className="sr-only">{t('practice.wizard.rubric.remove')}</span>
      </div>

      <div className="space-y-3">
        {rubric.map((criterion, index) => (
          <PracticeRubricCriterionCard
            key={criterion.id}
            criterion={criterion}
            index={index}
            contextLabel={contextLabel}
            disabled={actionsDisabled}
            onChange={(patch) => updateCriterion(index, patch)}
            onRemove={() => onChange(rubric.filter((item) => item.id !== criterion.id))}
          />
        ))}
      </div>

      <button
        type="button"
        disabled={actionsDisabled}
        onClick={() => onChange([...rubric, createEmptyCriterion()])}
        className="mt-4 flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-satin bg-transparent px-4 py-5 text-center transition-[background-color,border-color] duration-200 ease-out hover:border-[var(--satin-border-hover)] hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <Plus className="size-4" aria-hidden />
          {t('practice.wizard.rubric.add')}
        </span>
        <span className="text-xs text-muted-foreground">{t('practice.wizard.rubric.addHint')}</span>
      </button>

      {errorMessage ? (
        <p className="mt-3 text-sm text-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </PracticeWizardStepCard>
  );
}
