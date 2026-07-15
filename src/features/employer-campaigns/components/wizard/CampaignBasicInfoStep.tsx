import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaignMode } from '../../types/campaignManagement.types';
import type { CampaignWizardValues } from '../../hooks/useCampaignWizard';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';

interface CampaignBasicInfoStepProps {
  register: UseFormRegister<CampaignWizardValues>;
  errors: FieldErrors<CampaignWizardValues>;
  onBack?: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

export function CampaignBasicInfoStep({
  register,
  errors,
  onNext,
  onSaveDraft,
  isSaving,
}: CampaignBasicInfoStepProps) {
  const { t } = useLanguage();

  return (
    <SectionPanel
      icon={<Briefcase className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.basic')}
      description={t('employer.campaigns.wizard.steps.basicDesc')}
      footer={
        <CampaignWizardNav
          backDisabled
          onNext={onNext}
          onSaveDraft={onSaveDraft}
          isSaving={isSaving}
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">{t('employer.campaigns.form.title')}</Label>
          <Input id="title" aria-invalid={!!errors.title} {...register('title')} />
          <FieldError message={errors.title?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">{t('employer.campaigns.form.company')}</Label>
          <Input id="company" aria-invalid={!!errors.company} {...register('company')} />
          <FieldError message={errors.company?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">{t('employer.campaigns.form.location')}</Label>
          <Input id="location" aria-invalid={!!errors.location} {...register('location')} />
          <FieldError message={errors.location?.message} />
        </div>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          {t('employer.campaigns.form.mode')}
          <select
            className="h-8 rounded-lg border border-satin bg-surface-overlay px-2 text-sm"
            {...register('mode')}
          >
            {(['remote', 'hybrid', 'onsite'] as EmployerCampaignMode[]).map((mode) => (
              <option key={mode} value={mode}>
                {t(`employer.campaigns.mode.${mode}`)}
              </option>
            ))}
          </select>
        </label>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="summary">{t('employer.campaigns.form.summary')}</Label>
          <textarea
            id="summary"
            rows={3}
            className="w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm"
            aria-invalid={!!errors.summary}
            {...register('summary')}
          />
          <FieldError message={errors.summary?.message} />
        </div>
      </div>
    </SectionPanel>
  );
}
