import { Plus } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { RubricCriterion } from '../../types/campaignManagement.types';
import { CampaignRubricCriterionCard } from './criteria/CampaignRubricCriterionCard';

interface CampaignCriteriaManualListProps {
  rubric: RubricCriterion[];
  contextLabel: string;
  disabled?: boolean;
  onChangeRubric: (rubric: RubricCriterion[]) => void;
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

export function CampaignCriteriaManualList({
  rubric,
  contextLabel,
  disabled,
  onChangeRubric,
}: CampaignCriteriaManualListProps) {
  const { t } = useLanguage();

  const updateCriterion = (index: number, patch: Partial<RubricCriterion>) => {
    onChangeRubric(
      rubric.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  };

  return (
    <>
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
            disabled={Boolean(disabled)}
            onChange={(patch) => updateCriterion(index, patch)}
            onRemove={() => onChangeRubric(rubric.filter((item) => item.id !== criterion.id))}
          />
        ))}
      </div>

      <button
        type="button"
        disabled={Boolean(disabled)}
        onClick={() => onChangeRubric([...rubric, createEmptyCriterion()])}
        className="mt-1 flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-satin bg-transparent px-4 py-5 text-center transition-[background-color,border-color] duration-200 ease-out hover:border-[var(--satin-border-hover)] hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <Plus className="size-4" aria-hidden />
          {t('employer.campaigns.wizard.rubric.add')}
        </span>
      </button>
    </>
  );
}
