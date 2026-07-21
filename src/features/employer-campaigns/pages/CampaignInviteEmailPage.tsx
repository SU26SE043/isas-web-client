import { Link, useLocation, useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import { EmailInvitationFlow } from '../components/email-invitations/EmailInvitationFlow';
import { useEmployerCampaign } from '../hooks/useEmployerCampaigns';
import { tokenizeEmailList } from '../utils/emailInvitationUtils';

export function CampaignInviteEmailPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const { t } = useLanguage();
  const { campaign, isLoading, isError, errorStatus } = useEmployerCampaign(id);

  const draftFromRetry =
    typeof (location.state as { draftEmails?: unknown } | null)?.draftEmails === 'string'
      ? (location.state as { draftEmails: string }).draftEmails
      : '';
  const initialEmails = draftFromRetry ? tokenizeEmailList(draftFromRetry) : [];

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
        <EmailInvitationFlow campaign={campaign} initialEmails={initialEmails} />
      </div>
    </div>
  );
}
