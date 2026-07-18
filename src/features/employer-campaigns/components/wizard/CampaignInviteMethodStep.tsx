import { List, Trophy, Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { CandidateInviteMethod } from '../../types/campaignWizard.types';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';

interface CampaignInviteMethodStepProps {
  method: CandidateInviteMethod;
  emails: string[];
  error?: string | null;
  onSelectMethod: (method: 'emails' | 'cv-ranking') => void;
  onEmailsChange: (emails: string[]) => void;
  onSimulateCvRanking: () => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

export function CampaignInviteMethodStep({
  method,
  emails,
  error,
  onSelectMethod,
  onEmailsChange,
  onSimulateCvRanking,
  onBack,
  onNext,
  onSaveDraft,
  isSaving,
}: CampaignInviteMethodStepProps) {
  const { t } = useLanguage();

  return (
    <SectionPanel
      icon={<Users className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.inviteMethod')}
      description={t('employer.campaigns.wizard.steps.inviteMethodDesc')}
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
              method === 'emails' && 'border-foreground/40 bg-white/[0.06]',
            )}
            onClick={() => onSelectMethod('emails')}
          >
            <List className="size-5 text-foreground" aria-hidden />
            <span className="font-medium text-foreground">
              {t('employer.campaigns.wizard.candidatesEmails')}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('employer.campaigns.wizard.candidatesEmailsDesc')}
            </span>
          </button>

          <button
            type="button"
            className={cn(
              'flex flex-col gap-2 rounded-lg border border-satin bg-surface-overlay p-4 text-left transition',
              method === 'cv-ranking' && 'border-foreground/40 bg-white/[0.06]',
            )}
            onClick={() => {
              onSelectMethod('cv-ranking');
              onSimulateCvRanking();
            }}
          >
            <Trophy className="size-5 text-foreground" aria-hidden />
            <span className="font-medium text-foreground">
              {t('employer.campaigns.wizard.candidatesCv')}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('employer.campaigns.wizard.candidatesCvDesc')}
            </span>
          </button>
        </div>

        {method === 'emails' ? (
          <div className="space-y-2">
            <Label htmlFor="candidate-emails">{t('employer.campaigns.invite.emails')}</Label>
            <textarea
              id="candidate-emails"
              rows={8}
              className="w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm"
              placeholder={t('employer.campaigns.selection.placeholder')}
              value={emails.join('\n')}
              onChange={(e) =>
                onEmailsChange(
                  e.target.value
                    .split(/[\n,;]+/)
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              {t('employer.campaigns.wizard.emailListSummary').replace(
                '{count}',
                String(emails.length),
              )}
            </p>
          </div>
        ) : null}

        {method === 'cv-ranking' ? (
          <p className="rounded-lg border border-satin bg-surface-overlay px-4 py-3 text-sm text-muted-foreground">
            {t('employer.campaigns.wizard.cvUploadHint')}
          </p>
        ) : null}
      </div>
    </SectionPanel>
  );
}
