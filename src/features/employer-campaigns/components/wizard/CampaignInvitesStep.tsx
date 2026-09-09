import { useEffect, useMemo, useState } from 'react';
import { Info, Settings2, UsersRound } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import { campaignManagementService } from '../../services/campaignManagement.service';
import type { CampaignCandidateListItem, CampaignJobNeed } from '../../types/campaign.api.types';
import type { EmployerCampaign } from '../../types/campaignManagement.types';
import type { CampaignHardFiltersState } from '../../types/campaignWizard.types';
import { CampaignJobNeedsCard } from '../CampaignJobNeedsCard';
import { CampaignHardFilterSection } from './CampaignHardFilterSection';
import { CampaignWizardNav } from './CampaignWizardNav';
import { CvScreeningPanel } from '../screening/CvScreeningPanel';

type InviteTab = 'email' | 'cv';

interface CampaignInvitesStepProps {
  campaignId: string | null;
  campaign?: EmployerCampaign | null;
  jdText: string;
  hardFilters: CampaignHardFiltersState;
  inviteEmails: string[];
  onHardFiltersChange: (patch: Partial<CampaignHardFiltersState>) => void;
  onInviteEmailsChange: (emails: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmails(value: string): string[] {
  return Array.from(new Set(value.split(/[\s,;]+/).map((email) => email.trim().toLowerCase()).filter(Boolean)));
}

export function CampaignInvitesStep({
  campaignId,
  campaign,
  jdText,
  hardFilters,
  inviteEmails,
  onHardFiltersChange,
  onInviteEmailsChange,
  onBack,
  onNext,
}: CampaignInvitesStepProps) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<InviteTab>('email');
  const [emailText, setEmailText] = useState(inviteEmails.join('\n'));
  const [configOpen, setConfigOpen] = useState(false);
  const [jobNeeds, setJobNeeds] = useState<CampaignJobNeed[]>(campaign?.jobNeeds ?? []);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState(false);

  useEffect(() => {
    setEmailText(inviteEmails.join('\n'));
  }, [inviteEmails]);

  useEffect(() => {
    setJobNeeds(campaign?.jobNeeds ?? []);
  }, [campaign?.id, campaign?.jobNeeds]);

  useEffect(() => {
    if (tab !== 'cv' || !campaignId || jobNeeds.length > 0 || !jdText.trim() || suggesting) return;
    setSuggesting(true);
    setSuggestError(false);
    void campaignManagementService.suggestCampaignJobNeeds(campaignId)
      .then((updated) => setJobNeeds(updated.jobNeeds))
      .catch(() => setSuggestError(true))
      .finally(() => setSuggesting(false));
  }, [campaignId, jdText, jobNeeds.length, suggesting, tab]);

  const validEmails = useMemo(
    () => parseEmails(emailText).filter((email) => EMAIL_RE.test(email)),
    [emailText],
  );
  const invalidCount = parseEmails(emailText).filter((email) => !EMAIL_RE.test(email)).length;
  const saveEmails = (value: string) => {
    setEmailText(value);
    onInviteEmailsChange(parseEmails(value).filter((email) => EMAIL_RE.test(email)));
  };
  const addScreenedCandidates = (candidates: CampaignCandidateListItem[]) => {
    const candidateEmails = candidates.map((candidate) => candidate.email?.trim().toLowerCase() ?? '').filter(Boolean);
    const merged = Array.from(new Set([...inviteEmails, ...candidateEmails]));
    onInviteEmailsChange(merged);
    setEmailText(merged.join('\n'));
    setTab('email');
  };

  return (
    <SectionPanel
      icon={<UsersRound className="size-4" aria-hidden />}
      title={t('employer.campaigns.wizard.invites.title')}
      description={t('employer.campaigns.wizard.invites.description')}
      footer={<CampaignWizardNav onBack={onBack} onNext={onNext} />}
    >
      <div className="space-y-5">
        <Alert variant="info">
          <AlertTitle>{t('employer.campaigns.wizard.invites.notSentTitle')}</AlertTitle>
          <AlertDescription>{t('employer.campaigns.wizard.invites.notSentDescription')}</AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-2 border-b border-satin" role="tablist" aria-label={t('employer.campaigns.wizard.invites.tabsLabel')}>
          <button type="button" role="tab" aria-selected={tab === 'email'} onClick={() => setTab('email')} className={`border-b-2 px-3 py-2 text-sm ${tab === 'email' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'}`}>
            {t('employer.campaigns.wizard.invites.emailTab')} <span className="text-xs">({validEmails.length})</span>
          </button>
          <button type="button" role="tab" aria-selected={tab === 'cv'} onClick={() => setTab('cv')} className={`border-b-2 px-3 py-2 text-sm ${tab === 'cv' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'}`}>
            {t('employer.campaigns.wizard.invites.cvTab')} <span className="text-xs">({inviteEmails.length})</span>
          </button>
        </div>

        {tab === 'email' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-wizard-invite-emails">{t('employer.campaigns.wizard.invites.emailLabel')}</Label>
              <textarea id="campaign-wizard-invite-emails" value={emailText} onChange={(event) => saveEmails(event.target.value)} placeholder={t('employer.campaigns.wizard.invites.emailPlaceholder')} className="min-h-36 w-full rounded-lg border border-satin bg-surface-base p-3 text-sm text-foreground outline-none focus-visible:border-foreground" />
              <p className="text-xs text-muted-foreground">{t('employer.campaigns.wizard.invites.emailHint').replace('{{count}}', String(validEmails.length))}</p>
              {invalidCount > 0 ? <p className="text-xs text-error">{t('employer.campaigns.wizard.invites.invalidEmailCount').replace('{{count}}', String(invalidCount))}</p> : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="frame-satin rounded-lg p-3"><p className="text-xs text-muted-foreground">{t('employer.campaigns.wizard.invites.summaryReady')}</p><p className="mt-1 text-xl font-semibold text-foreground">{validEmails.length}</p></div>
              <div className="frame-satin rounded-lg p-3"><p className="text-xs text-muted-foreground">{t('employer.campaigns.wizard.invites.summaryInvalid')}</p><p className="mt-1 text-xl font-semibold text-foreground">{invalidCount}</p></div>
              <div className="frame-satin rounded-lg p-3"><p className="text-xs text-muted-foreground">{t('employer.campaigns.wizard.invites.summaryExpiry')}</p><p className="mt-1 text-sm font-semibold text-foreground">{t('employer.campaigns.wizard.invites.summaryAtDeploy')}</p></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {suggesting ? <Alert variant="info"><AlertDescription>{t('employer.campaigns.wizard.invites.suggestingNeeds')}</AlertDescription></Alert> : null}
            {suggestError ? <Alert variant="warning"><AlertDescription>{t('employer.campaigns.wizard.invites.suggestFailed')}</AlertDescription></Alert> : null}
            {!campaignId ? <Alert variant="warning"><AlertDescription>{t('employer.campaigns.wizard.invites.saveDraftFirst')}</AlertDescription></Alert> : null}
            {campaignId ? <CvScreeningPanel campaignId={campaignId} isActive={false} allowDraftScreening hasJobNeeds={jobNeeds.length > 0} jobNeeds={jobNeeds} hideInvitationAction onAddCandidates={addScreenedCandidates} /> : null}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-info/30 bg-info/5 p-4 text-sm">
              <div className="flex items-start gap-2"><Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden /><p className="text-muted-foreground">{t('employer.campaigns.wizard.invites.aiReference')}</p></div>
              <Button type="button" variant="outline" onClick={() => setConfigOpen(true)}><Settings2 className="size-4" aria-hidden />{t('employer.campaigns.wizard.invites.configure')}</Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader><DialogTitle>{t('employer.campaigns.wizard.invites.configureTitle')}</DialogTitle><DialogDescription>{t('employer.campaigns.wizard.invites.configureDescription')}</DialogDescription></DialogHeader>
          <div className="space-y-5">
            {campaignId ? <CampaignJobNeedsCard campaignId={campaignId} initialNeeds={jobNeeds} editable onSaved={(updated) => setJobNeeds(updated.jobNeeds)} /> : null}
            <CampaignHardFilterSection value={hardFilters} onChange={onHardFiltersChange} />
          </div>
          <DialogFooter><Button type="button" onClick={() => setConfigOpen(false)}>{t('employer.campaigns.wizard.invites.configureDone')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionPanel>
  );
}
