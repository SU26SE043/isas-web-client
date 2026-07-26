import { Link, Navigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { useEmployerCampaign } from '../hooks/useEmployerCampaigns';

export function CampaignInviteCvPage() {
  const { id = '' } = useParams();
  const { t } = useLanguage();
  const { campaign, isLoading } = useEmployerCampaign(id);

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto bg-surface-base">
        <div className="page-container page-section mx-auto max-w-5xl">
          <p className="text-sm text-muted-foreground">{t('employer.campaigns.inviteFlow.cvTitle')}</p>
        </div>
      </div>
    );
  }

  if (campaign?.status === 'active') {
    return <Navigate to={`/employer/campaigns/${id}/cv-screening`} replace />;
  }

  if (campaign) {
    return <Navigate to={`/employer/campaigns/${id}`} replace />;
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-5xl space-y-6">
        <Link
          to={`/employer/campaigns/${id}/invite`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {t('employer.campaigns.inviteFlow.backToMethod')}
        </Link>
        <p className="text-sm text-muted-foreground">{t('employer.campaigns.detail.notFoundDescription')}</p>
      </div>
    </div>
  );
}
