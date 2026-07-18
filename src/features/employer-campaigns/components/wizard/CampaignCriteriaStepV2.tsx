import { ClipboardList, Plus } from 'lucide-react';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { RubricCriterion } from '../../types/campaignManagement.types';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';
import { CampaignRubricCriterionCard } from './criteria/CampaignRubricCriterionCard';
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

function createEmptyCriterion(): RubricCriterion {
  return {
    id: `new-${crypto.randomUUID().slice(0, 8)}`,
    name: '',
    description: '',
    weight: 0,
    maxScore: 10,
  };
}

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
  const canNext =
    weightValid &&
    maxScoreValid &&
    rubric.length > 0 &&
    !hasEmptyName &&
    !isSaving;

  const updateCriterion = (index: number, patch: Partial<RubricCriterion>) => {
    onChangeRubric(
      rubric.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  };

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

        <div className="mb-3 hidden grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_7.5rem_7rem_auto] gap-3 px-1 text-caption text-muted-foreground lg:grid">
          <span>{t('employer.campaigns.wizard.rubric.colCriterion')}</span>
          <span>{t('employer.campaigns.wizard.rubric.colDescription')}</span>
          <span>{t('employer.campaigns.wizard.rubric.colWeight')}</span>
          <span>{t('employer.campaigns.wizard.rubric.colMaxScore')}</span>
          <span className="sr-only">{t('employer.campaigns.wizard.rubric.remove')}</span>
        </div>

        <div className="space-y-3">
          {rubric.map((criterion, index) => (
            <CampaignRubricCriterionCard
              key={criterion.id}
              criterion={criterion}
              index={index}
              contextLabel={contextLabel}
              disabled={Boolean(isSaving)}
              onChange={(patch) => updateCriterion(index, patch)}
              onRemove={() => onChangeRubric(rubric.filter((item) => item.id !== criterion.id))}
            />
          ))}
        </div>

        <button
          type="button"
          disabled={Boolean(isSaving)}
          onClick={() => onChangeRubric([...rubric, createEmptyCriterion()])}
          className="mt-1 flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-satin bg-transparent px-4 py-5 text-center transition-[background-color,border-color] duration-200 ease-out hover:border-[var(--satin-border-hover)] hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <Plus className="size-4" aria-hidden />
            {t('employer.campaigns.wizard.rubric.add')}
          </span>
          <span className="text-xs text-muted-foreground">
            {t('employer.campaigns.wizard.rubric.addHint')}
          </span>
        </button>
      </div>
    </SectionPanel>
  );
}
