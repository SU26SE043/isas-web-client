import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AppPagination, DEFAULT_PAGE_SIZE } from '@/components/ui/app-pagination';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import { getApiStatusCode } from '@/shared/api/apiError';
import { AdminPageShell } from '../components/AdminPageShell';
import { AdminCampaignsTable } from '../components/campaigns/AdminCampaignsTable';
import { AdminCampaignsToolbar } from '../components/campaigns/AdminCampaignsToolbar';
import { useAdminCampaigns } from '../hooks/useAdminCampaigns';
import type { AdminCampaignStatusFilter } from '../types/adminCampaigns.types';
import {
  filterAdminCampaignsLocally,
  getAdminCampaignErrorKey,
  toAdminCampaignApiParams,
} from '../utils/adminCampaignsActions';

export function AdminCampaignsPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AdminCampaignStatusFilter>('all');
  const [orgIdInput, setOrgIdInput] = useState('');
  const [orgId, setOrgId] = useState('');
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<Array<string | null>>([]);

  const queryParams = toAdminCampaignApiParams({
    status,
    orgId,
    cursor: currentCursor,
    limit: pageSize,
  });

  const campaignsQuery = useAdminCampaigns(queryParams);
  const isForbidden = getApiStatusCode(campaignsQuery.error) === 403;

  const visibleItems = useMemo(
    () => filterAdminCampaignsLocally(campaignsQuery.data?.items ?? [], search),
    [campaignsQuery.data?.items, search],
  );

  const nextCursor = campaignsQuery.data?.nextCursor ?? null;
  const pageNumber = cursorHistory.length + 1;

  const resetPagination = () => {
    setCurrentCursor(null);
    setCursorHistory([]);
  };

  const applyOrgIdFilter = (value: string) => {
    const next = value.trim();
    if (next === orgId) return;
    setOrgId(next);
    resetPagination();
  };

  const handleStatusChange = (value: AdminCampaignStatusFilter) => {
    setStatus(value);
    resetPagination();
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    resetPagination();
  };

  const goToNextPage = () => {
    if (!nextCursor) return;
    setCursorHistory((previous) => [...previous, currentCursor]);
    setCurrentCursor(nextCursor);
  };

  const goToPreviousPage = () => {
    setCursorHistory((previous) => {
      if (previous.length === 0) return previous;
      const updated = [...previous];
      const previousCursor = updated.pop() ?? null;
      setCurrentCursor(previousCursor);
      return updated;
    });
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setOrgIdInput('');
    setOrgId('');
    resetPagination();
  };

  const hasActiveFilters = status !== 'all' || Boolean(orgId.trim()) || Boolean(search.trim());

  return (
    <AdminPageShell
      title={t('admin.campaignsManage.title')}
      description={t('admin.campaignsManage.description')}
      actions={
        campaignsQuery.data ? (
          <p className="text-sm text-muted-foreground">
            {t('admin.campaignsManage.pageCount').replace(
              '{{count}}',
              String(campaignsQuery.data.items.length),
            )}
          </p>
        ) : null
      }
    >
      <AdminCampaignsToolbar
        search={search}
        status={status}
        orgId={orgIdInput}
        isFetching={campaignsQuery.isFetching}
        onSearchChange={setSearch}
        onStatusChange={handleStatusChange}
        onOrgIdChange={setOrgIdInput}
        onOrgIdCommit={applyOrgIdFilter}
        onRefresh={() => {
          const next = orgIdInput.trim();
          if (next !== orgId) {
            applyOrgIdFilter(orgIdInput);
            return;
          }
          void campaignsQuery.refetch();
        }}
      />

      {campaignsQuery.isFetching && campaignsQuery.data ? (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {t('admin.campaignsManage.loadingSoft')}
        </p>
      ) : null}

      {campaignsQuery.isLoading ? (
        <div className="space-y-3" aria-live="polite">
          <p className="text-sm text-muted-foreground">{t('admin.campaignsManage.loading')}</p>
          <div className="h-12 animate-pulse rounded-xl border border-satin bg-surface-overlay" />
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-xl border border-satin bg-surface-overlay"
            />
          ))}
        </div>
      ) : null}

      {campaignsQuery.isError ? (
        <div className="space-y-3">
          <Alert variant="error">
            <AlertDescription>{t(getAdminCampaignErrorKey(campaignsQuery.error))}</AlertDescription>
          </Alert>
          {isForbidden ? (
            <p className="text-sm text-muted-foreground">
              {t('admin.campaignsManage.errors.forbiddenHint')}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {!isForbidden ? (
              <Button type="button" variant="outline" onClick={() => void campaignsQuery.refetch()}>
                {t('admin.campaignsManage.errors.retry')}
              </Button>
            ) : null}
            <Button type="button" variant="outline" render={<Link to="/admin/dashboard" />}>
              {t('admin.campaignsManage.errors.backHome')}
            </Button>
          </div>
        </div>
      ) : null}

      {campaignsQuery.data && !campaignsQuery.isError ? (
        campaignsQuery.data.items.length === 0 ? (
          <EmptyState
            variant="no-data"
            title={
              hasActiveFilters
                ? t('admin.campaignsManage.empty.filteredTitle')
                : t('admin.campaignsManage.empty.title')
            }
            description={
              hasActiveFilters
                ? t('admin.campaignsManage.empty.filteredDescription')
                : t('admin.campaignsManage.empty.description')
            }
            action={
              hasActiveFilters ? (
                <Button type="button" variant="outline" onClick={clearFilters}>
                  {t('admin.campaignsManage.empty.clearFilters')}
                </Button>
              ) : null
            }
          />
        ) : visibleItems.length === 0 ? (
          <EmptyState
            variant="no-results"
            title={t('admin.campaignsManage.empty.filteredTitle')}
            description={t('admin.campaignsManage.empty.searchDescription')}
            action={
              <Button type="button" variant="outline" onClick={() => setSearch('')}>
                {t('admin.campaignsManage.empty.clearSearch')}
              </Button>
            }
          />
        ) : (
          <div className="space-y-4 rounded-xl border border-satin bg-surface-raised p-4">
            <AdminCampaignsTable items={visibleItems} />
            <AppPagination
              mode="cursor"
              currentPage={pageNumber}
              pageSize={pageSize}
              itemCount={campaignsQuery.data.items.length}
              itemLabel={t('admin.campaignsManage.pagination.itemLabel')}
              hasPreviousPage={cursorHistory.length > 0}
              hasNextPage={Boolean(nextCursor)}
              isLoading={campaignsQuery.isFetching}
              onPageSizeChange={handlePageSizeChange}
              onPreviousPage={goToPreviousPage}
              onNextPage={goToNextPage}
            />
          </div>
        )
      ) : null}
    </AdminPageShell>
  );
}
