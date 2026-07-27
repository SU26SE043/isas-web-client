import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import { CampaignContextHeader } from '../components/CampaignContextHeader';
import { CampaignSummaryBar } from '../components/CampaignSummaryBar';
import { CvScreeningPanel } from '../components/screening/CvScreeningPanel';
import { useEmployerCampaign } from '../hooks/useEmployerCampaigns';

export function CampaignCvScreeningPage() {
  const { id = '' } = useParams();
  const { t } = useLanguage();
  const { campaign, isLoading, isError } = useEmployerCampaign(id);

  if (isLoading) {
    return (
      <div className="page-container page-section mx-auto max-w-[1440px] space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="page-container page-section mx-auto max-w-4xl">
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
      <div className="page-container page-section mx-auto max-w-[1440px] space-y-5">
        <CampaignContextHeader
          campaign={campaign}
          mode="invitations"
          title={t('employer.campaigns.workspace.screeningTitle')}
          description={t('employer.campaigns.workspace.screeningDescription')}
        />
        <CampaignSummaryBar campaign={campaign} />
        <CvScreeningPanel campaignId={campaign.id} isActive={campaign.status === 'active'} />
      </div>
    </div>
  );
}
