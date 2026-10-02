import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { RubricCategoryTabs } from '../components/RubricCategoryTabs';
import { RubricCriteriaTable } from '../components/RubricCriteriaTable';
import { RubricPageSkeleton } from '../components/RubricPageSkeleton';
import { RubricStatusPanel } from '../components/RubricStatusPanel';
import { RubricSummary } from '../components/RubricSummary';
import { RubricWeightStatus } from '../components/RubricWeightStatus';
import { ResetRubricDialog } from '../components/ResetRubricDialog';
import { UnsavedChangesDialog } from '../components/UnsavedChangesDialog';
import { useCandidateRubric } from '../hooks/useCandidateRubric';
import type { RubricValidationCode } from '../types/rubric.types';
import { PageHeader } from '@/components/patterns/PageHeader';
import { safeCandidateReturnTo } from '@/features/practice/utils/practiceWizardDraft';
import type { JobCategory } from '../types/rubric.types';
import { getDefaultRubric } from '../services/candidateRubrics.service';
import { CANDIDATE_RUBRIC_QUERY_KEY } from '../hooks/useCandidateRubric';
import { DefaultRubricDiffDialog } from '../components/DefaultRubricDiffDialog';

function validationMessage(t: (key: string) => string, code: RubricValidationCode | null): string | null {
  if (!code) return null;
  return t(`rubrics.validation.${code}`);
}

export function CandidateRubricsPage() {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const returnCategory: JobCategory | null = categoryParam === 'FE' || categoryParam === 'BE' || categoryParam === 'BA' ? categoryParam : null;
  const returnLanguage = searchParams.get('language') === 'en' ? 'en' : 'vi';
  const returnTo = safeCandidateReturnTo(searchParams.get('returnTo'));
  const [returnPending, setReturnPending] = useState(false);
  const [showDefaultDiff, setShowDefaultDiff] = useState(false);
  useEffect(() => {
    if (returnTo && language !== returnLanguage) setLanguage(returnLanguage);
  }, [language, returnLanguage, returnTo, setLanguage]);
  usePageTitle(t('rubrics.pageTitle'));

  const flow = useCandidateRubric(returnCategory ?? undefined);
  const hasNewDefault = flow.isCustom && flow.defaultVersion != null && flow.basedOnDefaultVersion != null && flow.defaultVersion > flow.basedOnDefaultVersion;
  const defaultRubricQuery = useQuery({
    queryKey: [...CANDIDATE_RUBRIC_QUERY_KEY, 'default', flow.jobCategory, language, flow.defaultVersion],
    queryFn: ({ signal }) => getDefaultRubric(flow.jobCategory, language, signal),
    enabled: showDefaultDiff && hasNewDefault,
    retry: false,
  });
  const actionsDisabled = flow.isLoading || flow.isSaving || flow.isResetting || flow.isFetching;
  const validationMessageText = validationMessage(t, flow.validationCode);

  return (
    <div className="h-full overflow-y-auto bg-surface-page">
      <div className="app-page space-y-6">
        <PageHeader title={t('rubrics.pageTitle')} description={t('rubrics.pageDescription')} />

        {hasNewDefault ? <section className="frame-satin flex flex-wrap items-center justify-between gap-3 rounded-xl border border-info/30 bg-info/5 p-4" role="status">
          <p className="text-sm font-medium text-foreground">{t('rubrics.defaultUpdated.banner').replace('{version}', String(flow.defaultVersion))}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowDefaultDiff(true)}>{t('rubrics.defaultUpdated.diff')}</Button>
            <Button type="button" onClick={() => flow.setResetDialogOpen(true)}>{t('rubrics.defaultUpdated.apply')}</Button>
          </div>
        </section> : null}

        {returnTo ? (
          <div className="frame-satin space-y-3 rounded-xl border border-satin bg-surface-raised p-4" role="status">
            <p className="text-sm font-medium text-foreground">
              {t('rubrics.return.banner')
                .replace('{category}', t(`rubrics.domain.${returnCategory ?? flow.jobCategory}`))
                .replace('{language}', t(`rubrics.return.language.${returnLanguage}`))}
            </p>
            {returnCategory && flow.jobCategory !== returnCategory ? (
              <p className="text-sm text-warning">
                {t('rubrics.return.changedCategory').replace('{category}', t(`rubrics.domain.${flow.jobCategory}`))}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={actionsDisabled || (flow.isDirty && !flow.canSave)} onClick={() => {
                if (!flow.isDirty) { navigate(returnTo); return; }
                void flow.saveAsync().then(() => navigate(returnTo)).catch(() => undefined);
              }}>{t('rubrics.return.save')}</Button>
              <Button type="button" variant="secondary" disabled={actionsDisabled} onClick={() => {
                if (flow.isDirty) { setReturnPending(true); flow.requestDiscard(); return; }
                navigate(returnTo);
              }}>{t('rubrics.return.discard')}</Button>
            </div>
          </div>
        ) : null}

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
            />

            <RubricWeightStatus
              totalWeight={flow.totalWeight}
              totalWeightLabel={flow.totalWeightLabel}
              weightStatus={flow.weightStatus}
              serverError={flow.saveError}
            />

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
        onStay={() => { setReturnPending(false); flow.cancelUnsavedDialog(); }}
        onDiscard={() => {
          flow.confirmDiscardChanges();
          if (returnPending && returnTo) navigate(returnTo);
          setReturnPending(false);
        }}
      />

      <ResetRubricDialog
        open={flow.resetDialogOpen}
        isResetting={flow.isResetting}
        onOpenChange={flow.setResetDialogOpen}
        onConfirm={flow.reset}
      />
      <DefaultRubricDiffDialog
        open={showDefaultDiff}
        onOpenChange={setShowDefaultDiff}
        isLoading={defaultRubricQuery.isLoading}
        error={defaultRubricQuery.isError}
        defaultCriteria={defaultRubricQuery.data?.criteria ?? []}
        customCriteria={flow.criteria}
        version={flow.defaultVersion}
      />
    </div>
  );
}
