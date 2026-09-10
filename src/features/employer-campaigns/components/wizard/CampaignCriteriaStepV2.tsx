import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Loader2, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import { getApiStatusCode } from '@/shared/api/apiError';
import type { RubricCriterion } from '../../types/campaignManagement.types';
import type { CampaignLanguage } from '../../types/campaign.api.types';
import {
  campaignCriteriaService,
  type CampaignCriteriaPreview,
} from '../../services/campaignCriteria.service';
import { CampaignCriteriaManualList } from './CampaignCriteriaManualList';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';

interface Props {
  rubric: RubricCriterion[];
  campaignId: string | null;
  jobCategory: string | null;
  language?: CampaignLanguage;
  error?: string | null;
  onChangeRubric: (rubric: RubricCriterion[]) => void;
  onReset: () => void;
  onBack: () => void;
  onNext: () => void;
  isSaving?: boolean;
}

export function previewToRubric(preview: CampaignCriteriaPreview): RubricCriterion[] {
  return preview.criteria.map((item, index) => ({
    id: item.id || `system-${index + 1}`,
    name: item.name,
    description: item.description,
    weight: Math.round((item.weight <= 1 ? item.weight * 100 : item.weight) * 100) / 100,
    maxScore: item.maxScore,
    minPct: null,
    levels: item.levels.length ? item.levels : undefined,
  }));
}

export function shouldShowRubricSummary(rubric: RubricCriterion[]): boolean {
  return rubric.length > 0;
}

export function CampaignCriteriaStepV2({
  rubric,
  jobCategory,
  language = 'vi',
  error,
  onChangeRubric,
  onReset,
  onBack,
  onNext,
  isSaving,
}: Props) {
  const { t } = useLanguage();
  const [customized, setCustomized] = React.useState(rubric.length > 0);
  const criteriaQuery = useQuery({
    queryKey: ['system-default-rubric', jobCategory, language],
    queryFn: () => campaignCriteriaService.preview(jobCategory ?? '', language),
    enabled: rubric.length === 0 && Boolean(jobCategory),
  });
  const preview = criteriaQuery.data ?? null;
  const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  const weightValid = Math.round(totalWeight * 10) / 10 === 100;
  const maxScoreValid = rubric.every(
    (item) => Number.isInteger(item.maxScore) && item.maxScore >= 1 && item.maxScore <= 10,
  );
  const hasEmptyName = rubric.some((item) => !item.name.trim());
  const canNext = weightValid && maxScoreValid && rubric.length > 0 && !hasEmptyName && !isSaving;
  const errorStatus = criteriaQuery.error ? getApiStatusCode(criteriaQuery.error) : undefined;

  React.useEffect(() => {
    if (rubric.length > 0 || !preview?.criteria.length) return;
    onChangeRubric(previewToRubric(preview));
  }, [onChangeRubric, preview, rubric.length]);

  const resetToStandard = () => {
    setCustomized(false);
    onReset();
  };

  return (
    <SectionPanel
      icon={<ClipboardList className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.criteria')}
      description={t('employer.campaigns.wizard.criteriaDescription')}
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onNext={onNext}
          isSaving={isSaving}
          nextDisabled={!canNext}
        />
      }
    >
      <div className="space-y-6">
        {error ? <FieldError message={error} /> : null}
        {criteriaQuery.isFetching && !rubric.length ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t('employer.campaigns.wizard.criteriaStandardLoading')}
          </div>
        ) : null}
        {criteriaQuery.isError ? (
          <Alert variant="error">
            <AlertDescription>
              <p>
                {(
                  errorStatus === 404
                    ? t('employer.campaigns.wizard.criteriaPreview.notFound')
                    : t('employer.campaigns.wizard.criteriaPreview.loadFailed')
                ).replace('{{job}}', jobCategory ?? '')}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => void criteriaQuery.refetch()}>
                  {t('employer.campaigns.wizard.criteriaPreview.retry')}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setCustomized(true)}>
                  {t('employer.campaigns.wizard.criteriaPreview.manualFallback')}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}
        {shouldShowRubricSummary(rubric) ? (
          <div className="frame-satin flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-overlay px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                {customized
                  ? t('employer.campaigns.wizard.criteriaCustomized')
                  : t('employer.campaigns.wizard.criteriaStandardApplied')}
              </p>
              <p className={weightValid ? 'text-xs text-muted-foreground' : 'text-xs text-error'}>
                {weightValid
                  ? t('employer.campaigns.wizard.rubric.totalSentence').replace(
                      '{{total}}',
                      `${Math.round(totalWeight * 10) / 10}`,
                    )
                  : t('employer.campaigns.wizard.rubric.totalInvalid')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!customized ? (
                <Button type="button" size="sm" onClick={() => setCustomized(true)}>
                  {t('employer.campaigns.wizard.criteriaCustomize')}
                </Button>
              ) : null}
              <Button type="button" size="sm" variant="ghost" onClick={resetToStandard} disabled={isSaving}>
                <RotateCcw className="mr-1.5 size-3.5" aria-hidden />
                {t('employer.campaigns.wizard.rubric.reset')}
              </Button>
            </div>
          </div>
        ) : null}
        <CampaignCriteriaManualList
          rubric={rubric}
          disabled={!customized || Boolean(isSaving)}
          onChangeRubric={onChangeRubric}
        />
      </div>
    </SectionPanel>
  );
}
