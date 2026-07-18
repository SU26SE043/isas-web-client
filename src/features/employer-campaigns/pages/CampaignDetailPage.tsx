import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import { CampaignDetailView } from '../components/CampaignDetailView';
import { useEmployerCampaign } from '../hooks/useEmployerCampaigns';

export function CampaignDetailPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { campaign, isLoading, isError, errorStatus, reload, publish, invite } =
    useEmployerCampaign(id);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [published, setPublished] = useState(false);

  const handlePublish = async () => {
    if (!campaign) return;
    const result = await publish(campaign.id);
    setWarnings(result.warnings);
    setPublished(result.warnings.length === 0);
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto bg-surface-base">
        <div className="page-container page-section mx-auto max-w-6xl space-y-3" aria-busy="true">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (isError && errorStatus === 403) {
    return (
      <DetailShell>
        <EmptyState
          variant="no-permission"
          title={t('employer.campaigns.detail.forbiddenTitle')}
          description={t('employer.campaigns.detail.forbiddenDescription')}
          action={
            <Link to="/employer/campaigns" className="btn-secondary inline-flex">
              {t('employer.campaigns.detail.back')}
            </Link>
          }
        />
      </DetailShell>
    );
  }

  if ((isError && errorStatus === 404) || (!isError && !campaign)) {
    return (
      <DetailShell>
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
      </DetailShell>
    );
  }

  if (isError && errorStatus !== 401) {
    return (
      <DetailShell>
        <EmptyState
          variant="no-results"
          title={t('employer.campaigns.detail.errorTitle')}
          description={t('employer.campaigns.detail.errorDescription')}
          action={
            <Button type="button" onClick={reload}>
              {t('employer.campaigns.detail.retry')}
            </Button>
          }
        />
      </DetailShell>
    );
  }

  if (!campaign) return null;

  return (
    <CampaignDetailView
      campaign={campaign}
      published={published}
      warnings={warnings}
      onPublish={handlePublish}
      onInvite={(emails) => invite(campaign.id, emails)}
    />
  );
}

function DetailShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-6xl space-y-6">
        <Link to="/employer/campaigns" className="text-sm text-muted-foreground hover:text-foreground">
          {t('employer.campaigns.detail.back')}
        </Link>
        {children}
      </div>
    </div>
  );
}
