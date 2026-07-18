import { useState } from 'react';
import { Link2, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { MagicLinkState } from '../../types/campaignWizard.types';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';

interface CampaignMagicLinkStepProps {
  magicLink: MagicLinkState;
  error?: string | null;
  onGenerate: () => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

export function CampaignMagicLinkStep({
  magicLink,
  error,
  onGenerate,
  onBack,
  onNext,
  onSaveDraft,
  isSaving,
}: CampaignMagicLinkStepProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const ready = magicLink.status === 'ready' && Boolean(magicLink.url);

  const handleCopy = async () => {
    if (!magicLink.url) return;
    try {
      await navigator.clipboard.writeText(magicLink.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <SectionPanel
      icon={<Link2 className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.magicLink')}
      description={t('employer.campaigns.wizard.steps.magicLinkDesc')}
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

        <div className="rounded-lg border border-satin bg-surface-overlay p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('employer.campaigns.wizard.magicLinkHelp')}
          </p>

          <button type="button" className="btn-primary" onClick={onGenerate}>
            {ready
              ? t('employer.campaigns.wizard.regenerateMagicLink')
              : t('employer.campaigns.wizard.generateMagicLink')}
          </button>

          {ready ? (
            <div className="space-y-4 border-t border-satin pt-4">
              <div className="space-y-2">
                <Label htmlFor="magic-url">{t('employer.campaigns.form.magicLinkUrl')}</Label>
                <div className="flex gap-2">
                  <Input id="magic-url" readOnly value={magicLink.url} className="font-mono text-xs" />
                  <button
                    type="button"
                    className="btn-secondary shrink-0"
                    onClick={() => void handleCopy()}
                    aria-label={t('employer.campaigns.wizard.copyLink')}
                  >
                    {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                  </button>
                </div>
              </div>

              <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="rounded-lg border border-satin bg-surface-base px-3 py-2">
                  <dt className="text-xs text-muted-foreground">
                    {t('employer.campaigns.form.campaignCode')}
                  </dt>
                  <dd className="mt-1 font-medium text-foreground">{magicLink.campaignCode}</dd>
                </div>
                <div className="rounded-lg border border-satin bg-surface-base px-3 py-2">
                  <dt className="text-xs text-muted-foreground">
                    {t('employer.campaigns.form.linkExpiry')}
                  </dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {magicLink.expiresAt || t('employer.campaigns.wizard.noExpiry')}
                  </dd>
                </div>
                <div className="rounded-lg border border-satin bg-surface-base px-3 py-2 sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">
                    {t('employer.campaigns.form.candidateCount')}
                  </dt>
                  <dd className="mt-1 font-medium text-foreground">{magicLink.candidateCount}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('employer.campaigns.wizard.magicLinkIdle')}
            </p>
          )}
        </div>
      </div>
    </SectionPanel>
  );
}
