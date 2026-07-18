import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import { CampaignFilters } from '../components/CampaignFilters';
import { CampaignManagementTable } from '../components/CampaignManagementTable';
import { useEmployerCampaigns } from '../hooks/useEmployerCampaigns';
import type { CampaignFilters as CampaignFiltersValue } from '../types/campaignManagement.types';

const DEFAULT_FILTERS: CampaignFiltersValue = { query: '', status: 'all' };

export function CampaignListPage() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const stableFilters = useMemo(() => filters, [filters]);
  const { campaigns, isLoading, isError, errorStatus, reload } = useEmployerCampaigns(stableFilters);

  const isForbidden = isError && errorStatus === 403;
  const isLoadError = isError && errorStatus !== 401 && errorStatus !== 403;

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-label text-muted-foreground">{t('employer.campaigns.list.eyebrow')}</p>
            <h1 className="heading-primary text-3xl text-foreground">{t('employer.campaigns.list.title')}</h1>
            <p className="body-text max-w-3xl text-sm text-muted-foreground">{t('employer.campaigns.list.subtitle')}</p>
          </div>
          <Button render={<Link to="/employer/campaigns/new" />}>{t('employer.campaigns.list.create')}</Button>
        </header>

        <CampaignFilters value={filters} onChange={setFilters} />

        {isLoading ? (
          <div className="space-y-3" aria-busy="true">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : null}

        {!isLoading && isForbidden ? (
          <EmptyState
            variant="no-permission"
            title={t('employer.campaigns.list.forbiddenTitle')}
            description={t('employer.campaigns.list.forbiddenDescription')}
          />
        ) : null}

        {!isLoading && isLoadError ? (
          <EmptyState
            variant="no-results"
            title={t('employer.campaigns.list.errorTitle')}
            description={t('employer.campaigns.list.errorDescription')}
            action={
              <Button type="button" onClick={reload}>
                {t('employer.campaigns.list.retry')}
              </Button>
            }
          />
        ) : null}

        {!isLoading && !isError && campaigns.length > 0 ? (
          <CampaignManagementTable campaigns={campaigns} />
        ) : null}

        {!isLoading && !isError && campaigns.length === 0 ? (
          <EmptyState
            variant="no-data"
            title={t('employer.campaigns.list.emptyTitle')}
            description={t('employer.campaigns.list.emptyDescription')}
            action={
              <Button render={<Link to="/employer/campaigns/new" />}>
                {t('employer.campaigns.list.create')}
              </Button>
            }
          />
        ) : null}
      </div>
    </div>
  );
}
