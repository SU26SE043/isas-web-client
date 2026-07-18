import { Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { InvitationEmailState } from '../../types/campaignWizard.types';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';

interface CampaignEmailStepProps {
  email: InvitationEmailState;
  error?: string | null;
  onChange: (patch: Partial<InvitationEmailState>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

export function CampaignEmailStep({
  email,
  error,
  onChange,
  onBack,
  onNext,
  onSaveDraft,
  isSaving,
}: CampaignEmailStepProps) {
  const { t } = useLanguage();

  return (
    <SectionPanel
      icon={<Mail className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.email')}
      description={t('employer.campaigns.wizard.steps.emailDesc')}
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
        {error ? <FieldError message={error} /> : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-subject">{t('employer.campaigns.form.emailSubject')}</Label>
              <Input
                id="email-subject"
                value={email.subject}
                onChange={(e) => onChange({ subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-body">{t('employer.campaigns.form.emailBody')}</Label>
              <textarea
                id="email-body"
                rows={10}
                className="w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm leading-relaxed"
                value={email.body}
                onChange={(e) => onChange({ body: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-btn">{t('employer.campaigns.form.emailButton')}</Label>
              <Input
                id="email-btn"
                value={email.buttonText}
                onChange={(e) => onChange({ buttonText: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-attach">{t('employer.campaigns.form.emailAttachment')}</Label>
              <Input
                id="email-attach"
                value={email.attachmentName ?? ''}
                onChange={(e) => onChange({ attachmentName: e.target.value || null })}
                placeholder={t('employer.campaigns.form.emailAttachmentPlaceholder')}
              />
            </div>
          </div>

          <div className="rounded-lg border border-satin bg-surface-overlay p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('employer.campaigns.wizard.emailPreview')}
            </p>
            <div className="mt-4 space-y-4 rounded-lg border border-satin bg-surface-base p-5">
              <p className="text-sm font-semibold text-foreground">
                {email.subject || t('employer.campaigns.wizard.emailPreviewEmpty')}
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {email.body || t('employer.campaigns.wizard.emailPreviewEmpty')}
              </p>
              <div>
                <span className="inline-flex rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background">
                  {email.buttonText || t('employer.campaigns.form.emailButton')}
                </span>
              </div>
              {email.attachmentName ? (
                <p className="text-xs text-muted-foreground">
                  {t('employer.campaigns.form.emailAttachment')}: {email.attachmentName}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
