/* Hallmark · pre-emit critique: P4 H5 E4 S5 R5 V4 */
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import { EmailInvitationFlow } from '../components/email-invitations/EmailInvitationFlow';
import { CampaignContextHeader } from '../components/CampaignContextHeader';
import { CampaignSummaryBar } from '../components/CampaignSummaryBar';
import { CvScreeningPanel } from '../components/screening/CvScreeningPanel';
import { useEmployerCampaign } from '../hooks/useEmployerCampaigns';
import { tokenizeEmailList } from '../utils/emailInvitationUtils';
import { useCampaignInvitationStore } from '../stores/campaignInvitationStore';

export function CampaignInviteEmailPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { campaign, isLoading, isError, errorStatus } = useEmployerCampaign(id);
  const invitationCampaignId = useCampaignInvitationStore((store) => store.campaignId);
  const storedCandidates = useCampaignInvitationStore((store) => store.selectedCandidates);
  const removeCandidate = useCampaignInvitationStore((store) => store.removeCandidate);
  const clearCandidates = useCampaignInvitationStore((store) => store.clearCandidates);

  const draftFromRetry =
    typeof (location.state as { draftEmails?: unknown } | null)?.draftEmails === 'string'
      ? (location.state as { draftEmails: string }).draftEmails
      : '';
  const selectedCandidates = invitationCampaignId === id ? storedCandidates : [];
  const initialEmails = Array.from(
    new Set([
      ...selectedCandidates.map((candidate) => candidate.email),
      ...(draftFromRetry ? tokenizeEmailList(draftFromRetry) : []),
    ]),
  );
  const tab = searchParams.get('tab') ?? 'cv-screening';

  if (location.pathname.includes('/invite/email')) {
    return <Navigate to={`/employer/campaigns/${id}/invitations?tab=invite`} replace />;
  }

  if (!['cv-screening', 'invite', 'invitation-list'].includes(tab)) {
    return <Navigate to={`/employer/campaigns/${id}/invitations?tab=cv-screening`} replace />;
  }

  if (isLoading) {
    return (
      <div className="page-container page-section mx-auto max-w-6xl space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!campaign || (isError && errorStatus === 404)) {
    return (
      <div className="page-container page-section mx-auto max-w-3xl">
        <EmptyState
          variant="no-results"
          title={t('employer.campaigns.detail.notFoundTitle')}
          description={t('employer.campaigns.detail.notFoundDescription')}
          action={
            <Link to="/employer/campaigns" className="btn-secondary inline-flex">
              {t('employer.campaigns.detail.back')}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-[1440px]">
        <div className="space-y-6">
          <CampaignContextHeader
            campaign={campaign}
            mode="invitations"
          />
          <div className="motion-safe:animate-in motion-safe:fade-in">
            <div className="space-y-5" hidden={tab !== 'cv-screening'}>
              <CampaignSummaryBar campaign={campaign} />
              <CvScreeningPanel
                campaignId={campaign.id}
                isActive={campaign.status === 'active'}
                hasJobNeeds={campaign.jobNeeds.length > 0}
                jobNeeds={campaign.jobNeeds}
              />
            </div>
            <div hidden={tab !== 'invite'}>
              <EmailInvitationFlow
                campaign={campaign}
                initialEmails={initialEmails}
                view="send"
                selectedCandidates={selectedCandidates}
                onRemoveSelectedCandidate={removeCandidate}
                onClearSelectedCandidates={clearCandidates}
              />
            </div>
            <div hidden={tab !== 'invitation-list'}>
              <EmailInvitationFlow campaign={campaign} view="history" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
