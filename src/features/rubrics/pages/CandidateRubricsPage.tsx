import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { RubricCategoryTabs } from '../components/RubricCategoryTabs';
import { RubricCriteriaTable } from '../components/RubricCriteriaTable';
import { RubricPageSkeleton } from '../components/RubricPageSkeleton';
import { RubricStatusPanel } from '../components/RubricStatusPanel';
import { RubricMaxScoreStatus } from '../components/RubricMaxScoreStatus';
import { RubricSummary } from '../components/RubricSummary';
import { RubricWeightStatus } from '../components/RubricWeightStatus';
import { ResetRubricDialog } from '../components/ResetRubricDialog';
import { UnsavedChangesDialog } from '../components/UnsavedChangesDialog';
import { useCandidateRubric } from '../hooks/useCandidateRubric';
import type { RubricValidationCode } from '../types/rubric.types';

function validationMessage(t: (key: string) => string, code: RubricValidationCode | null): string | null {
  if (!code) return null;
  return t(`rubrics.validation.${code}`);
}

export function CandidateRubricsPage() {
  const { t } = useLanguage();
  usePageTitle(t('rubrics.pageTitle'));

  const flow = useCandidateRubric();
  const actionsDisabled = flow.isLoading || flow.isSaving || flow.isResetting || flow.isFetching;
  const validationMessageText = validationMessage(t, flow.validationCode);

  return (
    <div className="h-full overflow-y-auto bg-surface-page">
      <div className="page-container page-section mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="heading-primary text-3xl text-foreground">{t('rubrics.pageTitle')}</h1>
          <p className="body-text max-w-3xl text-sm text-muted-foreground">{t('rubrics.pageDescription')}</p>
        </header>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <RubricCategoryTabs
            value={flow.jobCategory}
            onChange={flow.requestCategoryChange}
            disabled={actionsDisabled}
          />
          {!flow.isLoading && !flow.isError ? (
            <RubricStatusPanel
              isCustom={flow.isCustom}
              disabled={actionsDisabled}
              onReset={() => flow.setResetDialogOpen(true)}
            />
          ) : null}
        </div>

        {flow.isError ? (
          <EmptyState
            title={t('rubrics.error.load')}
            description=""
            action={
              <Button type="button" variant="secondary" onClick={() => void flow.refetch()}>
                {t('rubrics.error.retry')}
              </Button>
            }
          />
        ) : flow.isLoading ? (
          <RubricPageSkeleton />
        ) : (
          <div className="space-y-6">
            <RubricSummary
              criteriaCount={flow.criteria.length}
              totalWeightLabel={flow.totalWeightLabel}
              totalMaxScore={flow.totalMaxScore}
              weightStatus={flow.weightStatus}
              maxScoreStatus={flow.maxScoreStatus}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <RubricWeightStatus
                totalWeight={flow.totalWeight}
                totalWeightLabel={flow.totalWeightLabel}
                weightStatus={flow.weightStatus}
                serverError={flow.saveError}
              />
              <RubricMaxScoreStatus
                totalMaxScore={flow.totalMaxScore}
                maxScoreStatus={flow.maxScoreStatus}
              />
            </div>

            <RubricCriteriaTable
              criteria={flow.criteria}
              disabled={actionsDisabled}
              focusClientId={flow.focusClientIdRef.current}
              validationMessage={validationMessageText}
              isDirty={flow.isDirty}
              canSave={flow.canSave}
              isSaving={flow.isSaving}
              onAdd={flow.addCriterion}
              onSave={flow.save}
              onUpdate={flow.updateCriterion}
              onRemove={flow.removeCriterion}
            />
          </div>
        )}
      </div>

      <UnsavedChangesDialog
        open={flow.unsavedDialogOpen}
        onStay={flow.cancelUnsavedDialog}
        onDiscard={flow.confirmDiscardChanges}
      />

      <ResetRubricDialog
        open={flow.resetDialogOpen}
        isResetting={flow.isResetting}
        onOpenChange={flow.setResetDialogOpen}
        onConfirm={flow.reset}
      />
    </div>
  );
}
