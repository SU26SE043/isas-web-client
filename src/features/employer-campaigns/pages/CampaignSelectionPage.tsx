import { Link, useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import { CandidateSelectionPanel } from '../components/CandidateSelectionPanel';
import { useEmployerCampaign } from '../hooks/useEmployerCampaigns';

export function CampaignSelectionPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { campaign, isLoading, invite } = useEmployerCampaign(id);

  if (isLoading || !campaign) {
    return (
      <div className="h-full overflow-y-auto bg-surface-base">
        <div className="page-container page-section mx-auto max-w-4xl"><Skeleton className="h-72 w-full" /></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-4xl space-y-6">
        <Link to={`/employer/campaigns/${campaign.id}`} className="text-sm text-muted-foreground hover:text-foreground">
          {t('employer.campaigns.selection.back')}
        </Link>
        <header className="space-y-2">
          <p className="text-label text-muted-foreground">SCR-EMP-056 · FS-149</p>
          <h1 className="heading-primary text-3xl text-foreground">{t('employer.campaigns.selection.pageTitle')}</h1>
          <p className="text-sm text-muted-foreground">{campaign.title}</p>
        </header>
        <CandidateSelectionPanel onImport={(emails) => invite(campaign.id, emails)} />
      </div>
    </div>
  );
}
