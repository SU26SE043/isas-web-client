import { Rocket } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { CampaignInfoState } from '../../types/campaignWizard.types';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';

interface CampaignPublishStepProps {
  info: CampaignInfoState;
  questionCount: number;
  invitedCount: number;
  confirmed: boolean;
  error?: string | null;
  publishError?: string | null;
  onConfirmChange: (value: boolean) => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  isSaving?: boolean;
  isPublishing?: boolean;
}

export function CampaignPublishStep({
  info,
  questionCount,
  invitedCount,
  confirmed,
  error,
  publishError,
  onConfirmChange,
  onBack,
  onSaveDraft,
  onPublish,
  isSaving,
  isPublishing,
}: CampaignPublishStepProps) {
  const { t } = useLanguage();
  const displayError = error || publishError;

  return (
    <SectionPanel
      icon={<Rocket className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.publish')}
      description={t('employer.campaigns.wizard.steps.publishDesc')}
      footer={
        <CampaignWizardNav
          onBack={onBack}
          onSaveDraft={onSaveDraft}
          onPublish={onPublish}
          showPublish
          publishDisabled={!confirmed}
          isSaving={isSaving}
          isPublishing={isPublishing}
        />
      }
    >
      <div className="space-y-5">
        {displayError ? <FieldError message={displayError} /> : null}

        <div className="rounded-lg border border-satin bg-surface-overlay p-4">
          <h3 className="text-sm font-semibold text-foreground">
            {t('employer.campaigns.wizard.publishConfirmTitle')}
          </h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t('employer.campaigns.form.title')}</dt>
              <dd className="font-medium text-foreground">{info.title || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t('employer.campaigns.form.candidateCount')}</dt>
              <dd className="font-medium text-foreground">{invitedCount}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t('employer.campaigns.form.questionsUnit')}</dt>
              <dd className="font-medium text-foreground">{questionCount}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t('employer.campaigns.form.startsAt')}</dt>
              <dd className="font-medium text-foreground">{info.startsAt || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t('employer.campaigns.form.expiresAt')}</dt>
              <dd className="font-medium text-foreground">{info.expiresAt || '—'}</dd>
            </div>
          </dl>
        </div>

        <p className="rounded-lg border border-warning/40 bg-warning-bg/40 px-4 py-3 text-sm text-warning">
          {t('employer.campaigns.wizard.publishLockWarning')}
        </p>

        <div className="flex items-start gap-3 rounded-lg border border-satin bg-surface-overlay px-4 py-3">
          <input
            id="publish-confirm"
            type="checkbox"
            className="mt-1 size-4 rounded border-satin"
            checked={confirmed}
            disabled={isPublishing}
            onChange={(e) => onConfirmChange(e.target.checked)}
          />
          <Label htmlFor="publish-confirm" className="leading-snug">
            {t('employer.campaigns.wizard.publishConfirmCheckbox')}
          </Label>
        </div>

        {isPublishing ? (
          <ol className="space-y-2 rounded-lg border border-satin bg-surface-overlay px-4 py-3 text-sm text-muted-foreground">
            {[
              'employer.campaigns.wizard.publishProgress.create',
              'employer.campaigns.wizard.publishProgress.rubric',
              'employer.campaigns.wizard.publishProgress.questions',
              'employer.campaigns.wizard.publishProgress.link',
              'employer.campaigns.wizard.publishProgress.email',
              'employer.campaigns.wizard.publishProgress.done',
            ].map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ol>
        ) : null}
      </div>
    </SectionPanel>
  );
}
