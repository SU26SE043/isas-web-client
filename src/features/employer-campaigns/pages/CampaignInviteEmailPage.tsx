import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import { EmailInvitationFlow } from '../components/email-invitations/EmailInvitationFlow';
import { CampaignContextHeader } from '../components/CampaignContextHeader';
import { useEmployerCampaign } from '../hooks/useEmployerCampaigns';
import { tokenizeEmailList } from '../utils/emailInvitationUtils';
import { useCampaignInvitationStore } from '../stores/campaignInvitationStore';

export function CampaignInviteEmailPage() {
  const { id = '' } = useParams();
  const location = useLocation();
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
  const isHistory = location.pathname.endsWith('/invitations');

  if (location.pathname.includes('/invite/email')) {
    return <Navigate to={`/employer/campaigns/${id}/invitations/new`} replace />;
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
      <div className="page-container page-section mx-auto max-w-6xl">
        <div className="space-y-6">
          <CampaignContextHeader
            campaign={campaign}
            title={t(
              isHistory
                ? 'employer.campaigns.workspace.invitationsTitle'
                : 'employer.campaigns.workspace.inviteTitle',
            )}
            description={t(
              isHistory
                ? 'employer.campaigns.workspace.invitationsDescription'
                : 'employer.campaigns.workspace.inviteDescription',
            )}
          />
          <EmailInvitationFlow
            campaign={campaign}
            initialEmails={initialEmails}
            view={isHistory ? 'history' : 'send'}
            selectedCandidates={isHistory ? [] : selectedCandidates}
            onRemoveSelectedCandidate={removeCandidate}
            onClearSelectedCandidates={clearCandidates}
          />
        </div>
      </div>
    </div>
  );
}
