import { useMemo, useState } from 'react';
import { BriefcaseBusiness } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import { CampaignCard } from '../components/CampaignCard';
import { CampaignFilters } from '../components/CampaignFilters';
import { useCampaigns } from '../hooks/useCampaign';
import type { CampaignFilters as CampaignFiltersValue } from '../types/campaign.types';

const DEFAULT_FILTERS: CampaignFiltersValue = {
  query: '',
  mode: 'all',
  seniority: 'all',
};

function CampaignSkeletonGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="border border-subtle bg-surface-raised">
          <CardContent className="space-y-4 p-5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CampaignBrowsePage() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const stableFilters = useMemo(() => filters, [filters]);
  const { campaigns, isLoading } = useCampaigns(stableFilters);

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-label text-muted-foreground">{t('campaigns.browse.eyebrow')}</p>
            <h1 className="heading-primary text-3xl text-foreground">{t('campaigns.browse.title')}</h1>
            <p className="body-text max-w-3xl text-sm text-muted-foreground">{t('campaigns.browse.subtitle')}</p>
          </div>
          <div className="rounded-xl border border-subtle bg-surface-raised px-4 py-3">
            <p className="text-sm text-muted-foreground">{t('campaigns.browse.available')}</p>
            <p className="text-2xl font-semibold text-foreground">{campaigns.length}</p>
          </div>
        </header>

        <CampaignFilters value={filters} onChange={setFilters} />

        {isLoading ? <CampaignSkeletonGrid /> : null}
        {!isLoading && campaigns.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : null}
        {!isLoading && campaigns.length === 0 ? (
          <Card className="border border-subtle bg-surface-raised">
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <BriefcaseBusiness className="size-10 text-muted-foreground" aria-hidden />
              <h2 className="text-lg font-semibold text-foreground">{t('campaigns.browse.emptyTitle')}</h2>
              <p className="max-w-md text-sm text-muted-foreground">{t('campaigns.browse.emptyDescription')}</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
