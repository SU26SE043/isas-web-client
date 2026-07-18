import { Link, useNavigate, useParams } from 'react-router-dom';
import { List, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import { useEmployerCampaign } from '../hooks/useEmployerCampaigns';
import { CampaignManagementStatusBadge } from '../components/CampaignManagementStatusBadge';

export function CampaignInvitePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { campaign, isLoading, isError, errorStatus } = useEmployerCampaign(id);

  if (isLoading) {
    return (
      <div className="page-container page-section mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
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

  const isActive = campaign.status === 'active';

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-3xl space-y-6">
        <Link
          to={`/employer/campaigns/${id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {t('employer.campaigns.inviteFlow.backToDetail')}
        </Link>

        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CampaignManagementStatusBadge status={campaign.status} />
          </div>
          <h1 className="heading-primary text-3xl text-foreground">
            {t('employer.campaigns.inviteFlow.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {campaign.title} · {t('employer.campaigns.inviteFlow.subtitle')}
          </p>
        </header>

        {!isActive ? (
          <p className="rounded-lg border border-warning/40 bg-warning-bg px-4 py-3 text-sm text-warning">
            {t('employer.campaigns.inviteFlow.needActive')}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled={!isActive}
            className="flex flex-col gap-3 rounded-lg border border-satin bg-surface-overlay p-5 text-left transition enabled:hover:border-foreground/40 disabled:opacity-50"
            onClick={() => navigate(`/employer/campaigns/${id}/invite/cv`)}
          >
            <Trophy className="size-5 text-foreground" aria-hidden />
            <span className="font-semibold text-foreground">
              {t('employer.campaigns.inviteFlow.cvTitle')}
            </span>
            <span className="text-sm text-muted-foreground">
              {t('employer.campaigns.inviteFlow.cvDesc')}
            </span>
            <span className="mt-auto text-sm font-medium text-foreground">
              {t('employer.campaigns.inviteFlow.cvCta')}
            </span>
          </button>

          <button
            type="button"
            disabled={!isActive}
            className="flex flex-col gap-3 rounded-lg border border-satin bg-surface-overlay p-5 text-left transition enabled:hover:border-foreground/40 disabled:opacity-50"
            onClick={() => navigate(`/employer/campaigns/${id}/invite/email`)}
          >
            <List className="size-5 text-foreground" aria-hidden />
            <span className="font-semibold text-foreground">
              {t('employer.campaigns.inviteFlow.emailTitle')}
            </span>
            <span className="text-sm text-muted-foreground">
              {t('employer.campaigns.inviteFlow.emailDesc')}
            </span>
            <span className="mt-auto text-sm font-medium text-foreground">
              {t('employer.campaigns.inviteFlow.emailCta')}
            </span>
          </button>
        </div>

        <Button variant="outline" render={<Link to={`/employer/campaigns/${id}`} />}>
          {t('employer.campaigns.inviteFlow.cancel')}
        </Button>
      </div>
    </div>
  );
}
