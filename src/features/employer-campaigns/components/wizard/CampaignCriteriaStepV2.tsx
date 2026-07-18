import { Scale, Sparkles, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SectionPanel } from '@/components/ui/section-panel';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { RubricCriterion } from '../../types/campaignManagement.types';
import type { RubricSource } from '../../types/campaignWizard.types';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';

interface CampaignCriteriaStepV2Props {
  rubricSource: RubricSource;
  rubric: RubricCriterion[];
  totalWeight: number;
  rubricSavedAt: string | null;
  error?: string | null;
  onSelectSource: (source: 'ai' | 'upload') => void;
  onGenerateAi: () => void;
  onChangeRubric: (rubric: RubricCriterion[]) => void;
  onSaveRubric: () => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

export function CampaignCriteriaStepV2({
  rubricSource,
  rubric,
  totalWeight,
  rubricSavedAt,
  error,
  onSelectSource,
  onGenerateAi,
  onChangeRubric,
  onSaveRubric,
  onBack,
  onNext,
  onSaveDraft,
  isSaving,
}: CampaignCriteriaStepV2Props) {
  const { t } = useLanguage();
  const weightOk = totalWeight === 100;

  const patchWeight = (index: number, weight: number) => {
    onChangeRubric(
      rubric.map((item, i) => (i === index ? { ...item, weight } : item)),
    );
  };

  return (
    <SectionPanel
      icon={<Scale className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.criteria')}
      description={t('employer.campaigns.wizard.steps.criteriaDesc')}
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onNext={onNext}
          onSaveDraft={onSaveDraft}
          isSaving={isSaving}
        />
      }
    >
      <div className="space-y-5">
        {error ? <FieldError message={error} /> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={cn(
              'flex flex-col gap-2 rounded-lg border border-satin bg-surface-overlay p-4 text-left transition',
              rubricSource === 'ai' && 'border-foreground/40 bg-white/[0.06]',
            )}
            onClick={() => {
              onSelectSource('ai');
              onGenerateAi();
            }}
          >
            <Sparkles className="size-5 text-foreground" aria-hidden />
            <span className="font-medium text-foreground">
              {t('employer.campaigns.wizard.criteriaAi')}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('employer.campaigns.wizard.criteriaAiDesc')}
            </span>
          </button>

          <button
            type="button"
            className={cn(
              'flex flex-col gap-2 rounded-lg border border-satin bg-surface-overlay p-4 text-left transition',
              rubricSource === 'upload' && 'border-foreground/40 bg-white/[0.06]',
            )}
            onClick={() => onSelectSource('upload')}
          >
            <Upload className="size-5 text-foreground" aria-hidden />
            <span className="font-medium text-foreground">
              {t('employer.campaigns.wizard.criteriaUpload')}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('employer.campaigns.wizard.criteriaUploadDesc')}
            </span>
          </button>
        </div>

        <div className="rounded-lg border border-satin bg-surface-overlay p-4">
          <p className={cn('text-sm font-semibold', weightOk ? 'text-success' : 'text-error')}>
            {t('employer.campaigns.form.weightTotal')}: {totalWeight}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('employer.campaigns.form.weightHelp')}
          </p>
          {rubricSavedAt ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {t('employer.campaigns.wizard.criteriaSavedAt').replace(
                '{time}',
                new Date(rubricSavedAt).toLocaleString(),
              )}
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          {rubric.map((criterion, index) => (
            <div
              key={criterion.id}
              className="grid gap-3 rounded-lg border border-satin bg-surface-overlay p-4 md:grid-cols-[1fr_120px]"
            >
              <div>
                <p className="font-medium text-foreground">{criterion.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{criterion.description}</p>
              </div>
              <Input
                type="number"
                min={0}
                max={100}
                value={criterion.weight}
                onChange={(e) => patchWeight(index, Number(e.target.value))}
                aria-label={`${criterion.name} weight`}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="btn-secondary"
          disabled={!weightOk}
          onClick={onSaveRubric}
        >
          {t('employer.campaigns.wizard.saveCriteria')}
        </button>
      </div>
    </SectionPanel>
  );
}
