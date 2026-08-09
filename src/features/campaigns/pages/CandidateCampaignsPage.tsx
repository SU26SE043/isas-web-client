import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, BriefcaseBusiness } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import { isPlaywrightRuntime } from '@/shared/mock/config';
import { MyCampaignCard } from '../components/MyCampaignCard';
import { useMyCampaigns } from '../hooks/useMyCampaigns';
import { LegacyCandidateCampaignsPage } from './LegacyCandidateCampaignsPage';

function LiveCandidateCampaignsPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight') ?? '';
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useMyCampaigns();
  const campaigns = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const sortedCampaigns = useMemo(() => {
    if (!highlightId) return campaigns;
    return [...campaigns].sort((left, right) => {
      if (left.campaignId === highlightId) return -1;
      if (right.campaignId === highlightId) return 1;
      return 0;
    });
  }, [campaigns, highlightId]);

  useEffect(() => {
    if (!highlightId) return;
    const element = document.querySelector(`[data-campaign-id="${CSS.escape(highlightId)}"]`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightId, sortedCampaigns]);

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <p className="text-label text-muted-foreground">{t('campaigns.my.eyebrow')}</p>
          <h1 className="heading-primary text-3xl text-foreground">{t('campaigns.my.title')}</h1>
          <p className="body-text max-w-3xl text-sm text-muted-foreground">{t('campaigns.my.subtitle')}</p>
        </header>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-5 py-10 text-center">
            <p className="text-sm text-rose-400">{t('campaigns.my.loadError')}</p>
            <Button
              type="button"
              className="mt-4"
              variant="outline"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <AlertCircle className="size-4" aria-hidden />
              {t('campaigns.my.retry')}
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && sortedCampaigns.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
            <BriefcaseBusiness className="size-10 text-zinc-500" aria-hidden />
            <h2 className="heading-secondary text-lg text-zinc-100">{t('campaigns.my.emptyTitle')}</h2>
            <p className="max-w-md text-sm text-zinc-400">{t('campaigns.my.emptyDescription')}</p>
            <p className="text-sm text-zinc-500">{t('campaigns.my.emptyHint')}</p>
          </div>
        ) : null}

        {!isLoading && !isError && sortedCampaigns.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {sortedCampaigns.map((campaign) => (
                <MyCampaignCard
                  key={campaign.campaignId}
                  campaign={campaign}
                  highlighted={campaign.campaignId === highlightId}
                />
              ))}
            </div>
            {hasNextPage ? (
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isFetchingNextPage}
                  onClick={() => void fetchNextPage()}
                >
                  {isFetchingNextPage ? t('campaigns.my.loadingMore') : t('campaigns.my.loadMore')}
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

export function CandidateCampaignsPage() {
  return isPlaywrightRuntime() ? <LegacyCandidateCampaignsPage /> : <LiveCandidateCampaignsPage />;
}
