import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { CampaignWizardValues } from '../../hooks/useCampaignWizard';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';

interface CampaignJobDescriptionStepProps {
  register: UseFormRegister<CampaignWizardValues>;
  errors: FieldErrors<CampaignWizardValues>;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

export function CampaignJobDescriptionStep({
  register,
  errors,
  onBack,
  onNext,
  onSaveDraft,
  isSaving,
}: CampaignJobDescriptionStepProps) {
  const { t } = useLanguage();

  return (
    <SectionPanel
      icon={<FileText className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.jobDescription')}
      description={t('employer.campaigns.wizard.steps.jobDescriptionDesc')}
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onNext={onNext}
          onSaveDraft={onSaveDraft}
          isSaving={isSaving}
        />
      }
    >
      <div className="space-y-2">
        <Label htmlFor="jobDescription">{t('employer.campaigns.form.jobDescription')}</Label>
        <textarea
          id="jobDescription"
          rows={12}
          className="w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm leading-relaxed"
          aria-invalid={!!errors.jobDescription}
          {...register('jobDescription')}
        />
        <FieldError message={errors.jobDescription?.message} />
      </div>
    </SectionPanel>
  );
}
