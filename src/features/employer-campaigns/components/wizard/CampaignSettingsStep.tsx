import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { CampaignProctoringConfig } from '../../types/campaignManagement.types';
import type { CampaignWizardValues } from '../../hooks/useCampaignWizard';
import { ProctoringSettingsFields } from '../ProctoringSettingsFields';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';

interface CampaignSettingsStepProps {
  register: UseFormRegister<CampaignWizardValues>;
  errors: FieldErrors<CampaignWizardValues>;
  proctoring: CampaignProctoringConfig;
  onProctoringChange: (next: CampaignProctoringConfig) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

export function CampaignSettingsStep({
  register,
  errors,
  proctoring,
  onProctoringChange,
  onBack,
  onNext,
  onSaveDraft,
  isSaving,
}: CampaignSettingsStepProps) {
  const { t } = useLanguage();

  return (
    <SectionPanel
      icon={<Settings className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.settings')}
      description={t('employer.campaigns.wizard.steps.settingsDesc')}
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onNext={onNext}
          onSaveDraft={onSaveDraft}
          isSaving={isSaving}
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="capacity">{t('employer.campaigns.form.capacity')}</Label>
          <Input
            id="capacity"
            type="number"
            aria-invalid={!!errors.capacity}
            {...register('capacity', { valueAsNumber: true })}
          />
          <FieldError message={errors.capacity?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">{t('employer.campaigns.form.deadline')}</Label>
          <Input
            id="deadline"
            type="date"
            aria-invalid={!!errors.deadline}
            {...register('deadline')}
          />
          <FieldError message={errors.deadline?.message} />
        </div>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          {t('employer.campaigns.form.locale')}
          <select
            className="h-8 rounded-lg border border-satin bg-surface-overlay px-2 text-sm"
            {...register('locale')}
          >
            <option value="en">{t('employer.campaigns.form.locale.en')}</option>
            <option value="vi">{t('employer.campaigns.form.locale.vi')}</option>
          </select>
        </label>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="welcomeMessage">{t('employer.campaigns.form.welcome')}</Label>
          <Input
            id="welcomeMessage"
            aria-invalid={!!errors.welcomeMessage}
            {...register('welcomeMessage')}
          />
          <FieldError message={errors.welcomeMessage?.message} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="completionMessage">{t('employer.campaigns.form.completion')}</Label>
          <Input
            id="completionMessage"
            aria-invalid={!!errors.completionMessage}
            {...register('completionMessage')}
          />
          <FieldError message={errors.completionMessage?.message} />
        </div>
        <div className="md:col-span-2">
          <ProctoringSettingsFields value={proctoring} onChange={onProctoringChange} />
        </div>
      </div>
    </SectionPanel>
  );
}
