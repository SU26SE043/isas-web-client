import { Link, useParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useLanguage } from '@/shared/languages';
import { CampaignResultsPanel } from '../components/results/CampaignResultsPanel';
import { CampaignContextHeader } from '../components/CampaignContextHeader';
import { useEmployerCampaign } from '../hooks/useEmployerCampaigns';

export function CampaignResultsPage() {
  const { id = '' } = useParams();
  const { t } = useLanguage();
  const { campaign, isLoading, isError, reload } = useEmployerCampaign(id);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-base">
        <Spinner className="size-8" label={t('employer.campaigns.results.loading')} />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="h-full overflow-y-auto bg-surface-base">
        <div className="page-container page-section mx-auto max-w-5xl space-y-4">
          <Alert variant="error">
            <AlertDescription>{t('employer.campaigns.results.errors.notFound')}</AlertDescription>
          </Alert>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={reload}>
              {t('employer.campaigns.results.errors.retry')}
            </Button>
            <Button type="button" variant="outline" render={<Link to="/employer/campaigns" />}>
              {t('employer.campaigns.results.errors.backToList')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-6xl space-y-6">
        <CampaignContextHeader
          campaign={campaign}
          mode="overview"
          title={t('employer.campaigns.workspace.resultsTitle')}
          description={t('employer.campaigns.workspace.resultsDescription')}
        />
        <CampaignResultsPanel
          campaignId={campaign.id}
          passScorePct={campaign.passScorePct}
          enabled
        />
      </div>
    </div>
  );
}
