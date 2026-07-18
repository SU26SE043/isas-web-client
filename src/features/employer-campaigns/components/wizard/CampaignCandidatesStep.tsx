import { Users, List, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { CandidateInviteMethod, RankedCandidate } from '../../types/campaignWizard.types';
import { CampaignWizardNav } from './CampaignWizardNav';
import { FieldError } from './FieldError';

interface CampaignCandidatesStepProps {
  method: CandidateInviteMethod;
  emails: string[];
  ranked: RankedCandidate[];
  threshold: number;
  error?: string | null;
  onSelectMethod: (method: 'emails' | 'cv-ranking') => void;
  onEmailsChange: (emails: string[]) => void;
  onThreshold: (threshold: number) => void;
  onSimulateCvRanking: () => void;
  onToggleCandidate: (id: string) => void;
  onSelectAboveThreshold: () => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

export function CampaignCandidatesStep({
  method,
  emails,
  ranked,
  threshold,
  error,
  onSelectMethod,
  onEmailsChange,
  onThreshold,
  onSimulateCvRanking,
  onToggleCandidate,
  onSelectAboveThreshold,
  onBack,
  onNext,
  onSaveDraft,
  isSaving,
}: CampaignCandidatesStepProps) {
  const { t } = useLanguage();

  return (
    <SectionPanel
      icon={<Users className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.steps.candidates')}
      description={t('employer.campaigns.wizard.steps.candidatesDesc')}
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
              if (ranked.length === 0) onSimulateCvRanking();
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
          </div>
        ) : null}

        {method === 'cv-ranking' ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-2">
                <Label htmlFor="match-threshold">
                  {t('employer.campaigns.form.matchThreshold')}
                </Label>
                <Input
                  id="match-threshold"
                  type="number"
                  min={0}
                  max={100}
                  className="w-28"
                  value={threshold}
                  onChange={(e) => onThreshold(Number(e.target.value) || 0)}
                />
              </div>
              <button type="button" className="btn-secondary" onClick={onSelectAboveThreshold}>
                {t('employer.campaigns.wizard.selectAboveThreshold')}
              </button>
              <button type="button" className="btn-ghost" onClick={onSimulateCvRanking}>
                {t('employer.campaigns.wizard.rerunRanking')}
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-satin">
              <table className="w-full min-w-[540px] text-left text-sm">
                <thead className="border-b border-satin bg-surface-overlay text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">{t('employer.campaigns.wizard.select')}</th>
                    <th className="px-3 py-2 font-medium">{t('employer.campaigns.detail.candidateName')}</th>
                    <th className="px-3 py-2 font-medium">{t('employer.campaigns.detail.candidateEmail')}</th>
                    <th className="px-3 py-2 font-medium">{t('employer.campaigns.form.overallMatch')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((row) => (
                    <tr key={row.id} className="border-b border-satin last:border-0">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => onToggleCandidate(row.id)}
                          aria-label={row.name}
                          className="size-4 rounded border-satin"
                        />
                      </td>
                      <td className="px-3 py-2 text-foreground">{row.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.email}</td>
                      <td className="px-3 py-2 text-foreground">{row.overallMatch}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </SectionPanel>
  );
}
