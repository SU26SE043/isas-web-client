import { Scale } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SectionPanel } from '@/components/ui/section-panel';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { RubricCriterion } from '../../types/campaignManagement.types';
import { CampaignWizardNav } from './CampaignWizardNav';

interface CampaignCriteriaStepProps {
  rubric: RubricCriterion[];
  onChangeWeight: (index: number, weight: number) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

export function CampaignCriteriaStep({
  rubric,
  onChangeWeight,
  onBack,
  onNext,
  onSaveDraft,
  isSaving,
}: CampaignCriteriaStepProps) {
  const { t } = useLanguage();
  const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight), 0);

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
      <div className="space-y-4">
        <div className="rounded-xl border border-satin bg-surface-overlay p-4">
          <p className={cn('text-sm font-semibold', totalWeight === 100 ? 'text-success' : 'text-error')}>
            {t('employer.campaigns.form.weightTotal')}: {totalWeight}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t('employer.campaigns.form.weightHelp')}</p>
        </div>
        {rubric.map((criterion, index) => (
          <div
            key={criterion.id}
            className="grid gap-3 rounded-xl border border-satin bg-surface-overlay p-4 md:grid-cols-[1fr_120px]"
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
              onChange={(event) => onChangeWeight(index, Number(event.target.value))}
              aria-label={`${criterion.name} weight`}
            />
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}
