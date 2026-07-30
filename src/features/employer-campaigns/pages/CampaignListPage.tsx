/* Hallmark · pre-emit critique: P4 H5 E4 S4 R5 V4 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppPagination, DEFAULT_PAGE_SIZE } from '@/components/ui/app-pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import { CampaignFilters } from '../components/CampaignFilters';
import { CampaignManagementTable } from '../components/CampaignManagementTable';
import { CampaignSummaryCards } from '../components/CampaignSummaryCards';
import { useEmployerCampaigns } from '../hooks/useEmployerCampaigns';
import type { CampaignFilters as CampaignFiltersValue } from '../types/campaignManagement.types';

const DEFAULT_FILTERS: CampaignFiltersValue = { query: '', status: 'all' };

export function CampaignListPage() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const stableFilters = useMemo(() => filters, [filters]);
  const summaryFilters = useMemo(() => DEFAULT_FILTERS, []);
  const summaryQuery = useEmployerCampaigns(summaryFilters);
  const { campaigns, isLoading, isError, errorStatus, reload } = useEmployerCampaigns(stableFilters);

  const isForbidden = isError && errorStatus === 403;
  const isLoadError = isError && errorStatus !== 401 && errorStatus !== 403;
  const totalPages = Math.max(1, Math.ceil(campaigns.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCampaigns = campaigns.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleFiltersChange = (nextFilters: CampaignFiltersValue) => {
    setFilters(nextFilters);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setCurrentPage(1);
  };

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-[1440px] space-y-5">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground">
              <span className="size-1.5 rounded-full bg-foreground" aria-hidden />
              {t('employer.campaigns.list.eyebrow')}
            </p>
            <h1 className="heading-primary text-3xl text-foreground sm:text-4xl">
              {t('employer.campaigns.list.title')}
            </h1>
            <p className="body-text max-w-3xl text-sm text-muted-foreground">
              {t('employer.campaigns.list.subtitle')}
            </p>
          </div>
          <Button
            size="lg"
            render={<Link to="/employer/campaigns/new" />}
            className="w-fit bg-white px-5 font-semibold text-black shadow-[0_12px_32px_rgba(255,255,255,0.12)] hover:bg-white/90 focus-visible:ring-white/40"
          >
            <Plus className="size-4" aria-hidden />
            {t('employer.campaigns.list.create')}
          </Button>
        </header>

        {summaryQuery.isLoading ? <Skeleton className="h-24 w-full" /> : null}
        {!summaryQuery.isLoading && !summaryQuery.isError ? (
          <CampaignSummaryCards campaigns={summaryQuery.campaigns} />
        ) : null}

        <CampaignFilters value={filters} onChange={handleFiltersChange} />

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
          <div className="space-y-3">
            <CampaignManagementTable campaigns={paginatedCampaigns} />
            <AppPagination
              currentPage={safePage}
              pageSize={pageSize}
              totalItems={campaigns.length}
              itemLabel={t('employer.campaigns.list.pagination.itemLabel')}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        ) : null}

        {!isLoading && !isError && campaigns.length === 0 ? (
          <EmptyState
            variant="no-data"
            title={t('employer.campaigns.list.emptyTitle')}
            description={t('employer.campaigns.list.emptyDescription')}
            action={
              <Button
                render={<Link to="/employer/campaigns/new" />}
                className="bg-white text-black hover:bg-white/90"
              >
                {t('employer.campaigns.list.createFirst')}
              </Button>
            }
          />
        ) : null}
      </div>
    </div>
  );
}
