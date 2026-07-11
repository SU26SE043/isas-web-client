import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
  const { campaigns, isLoading } = useEmployerCampaigns(stableFilters);

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

        {isLoading ? <Skeleton className="h-80 w-full" /> : null}
        {!isLoading && campaigns.length > 0 ? <CampaignManagementTable campaigns={campaigns} /> : null}
        {!isLoading && campaigns.length === 0 ? (
          <Card className="border border-subtle bg-surface-raised">
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <BriefcaseBusiness className="size-10 text-muted-foreground" aria-hidden />
              <h2 className="text-lg font-semibold text-foreground">{t('employer.campaigns.list.emptyTitle')}</h2>
              <p className="max-w-md text-sm text-muted-foreground">{t('employer.campaigns.list.emptyDescription')}</p>
              <Button render={<Link to="/employer/campaigns/new" />}>{t('employer.campaigns.list.create')}</Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
