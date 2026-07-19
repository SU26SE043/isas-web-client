import { ClipboardList } from 'lucide-react';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { RubricCriterion } from '../../types/campaignManagement.types';
import { CampaignCriteriaManualList } from './CampaignCriteriaManualList';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';
import { CampaignRubricTotalWeight } from './criteria/CampaignRubricTotalWeight';

interface CampaignCriteriaStepV2Props {
  rubric: RubricCriterion[];
  contextLabel: string;
  error?: string | null;
  onChangeRubric: (rubric: RubricCriterion[]) => void;
  onReset: () => void;
  onBack: () => void;
  onNext: () => void;
  isSaving?: boolean;
}

/** Manual rubric only — evaluation criteria no longer support file upload. */
export function CampaignCriteriaStepV2({
  rubric,
  contextLabel,
  error,
  onChangeRubric,
  onReset,
  onBack,
  onNext,
  isSaving,
}: CampaignCriteriaStepV2Props) {
  const { t } = useLanguage();
  const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  const totalMaxScore = rubric.reduce((sum, item) => sum + Number(item.maxScore || 0), 0);
  const weightValid = Math.round(totalWeight * 10) / 10 === 100;
  const maxScoreValid = rubric.every(
    (item) => Number.isFinite(item.maxScore) && item.maxScore >= 1 && item.maxScore <= 10,
  );
  const hasEmptyName = rubric.some((item) => !item.name.trim());
  const canNext = weightValid && maxScoreValid && rubric.length > 0 && !hasEmptyName && !isSaving;

  return (
    <SectionPanel
      icon={<ClipboardList className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.criteria')}
      description={t('employer.campaigns.wizard.steps.criteriaDesc')}
      headerAside={
        <CampaignRubricTotalWeight
          totalWeight={totalWeight}
          totalMaxScore={totalMaxScore}
          weightValid={weightValid}
          maxScoreValid={maxScoreValid}
          resetDisabled={Boolean(isSaving)}
          onReset={onReset}
        />
      }
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onNext={onNext}
          isSaving={isSaving}
          nextDisabled={!canNext}
          backDisabled={Boolean(isSaving)}
        />
      }
    >
      <div className="space-y-4">
        {error ? <FieldError message={error} /> : null}

        <CampaignCriteriaManualList
          rubric={rubric}
          contextLabel={contextLabel}
          disabled={Boolean(isSaving)}
          onChangeRubric={onChangeRubric}
        />
      </div>
    </SectionPanel>
  );
}
