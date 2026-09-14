import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppPagination } from '@/components/ui/app-pagination';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/patterns/EmptyState';
import { getApiStatusCode } from '@/shared/api/apiError';
import { useLanguage } from '@/shared/languages';
import { AdminPageShell } from '../components/AdminPageShell';
import { AdminDirectoryToolbar } from '../components/directory/AdminDirectoryToolbar';
import { AdminOrganizationsTable } from '../components/directory/AdminOrganizationsTable';
import { useAdminOrganizations } from '../hooks/useAdminDirectory';
import { useDirectoryCursor } from '../hooks/useDirectoryCursor';

const PAGE_SIZE_OPTIONS = [20, 50, 100, 500] as const;

export function AdminOrganizationsPage() {
  const { t } = useLanguage();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const pagination = useDirectoryCursor();
  const query = useAdminOrganizations({
    ...(search ? { search } : {}),
    ...(pagination.currentCursor ? { cursor: pagination.currentCursor } : {}),
    limit: pagination.pageSize,
  });
  const nextCursor = query.data?.nextCursor ?? null;

  const commitSearch = () => {
    const next = searchInput.trim();
    if (next === search) return;
    setSearch(next);
    pagination.reset();
  };

  const refresh = () => {
    if (searchInput.trim() !== search) {
      commitSearch();
      return;
    }
    void query.refetch();
  };

  const status = getApiStatusCode(query.error);
  const errorKey = status === 401
    ? 'admin.directory.errors.unauthorized'
    : status === 403
      ? 'admin.directory.errors.forbidden'
      : 'admin.directory.errors.load';

  return (
    <AdminPageShell
      title={t('admin.organizations.title')}
      description={t('admin.organizations.description')}
      actions={query.data ? <p className="text-sm text-muted-foreground">{t('admin.directory.pageCount').replace('{count}', String(query.data.items.length))}</p> : null}
    >
      <AdminDirectoryToolbar
        search={searchInput}
        isFetching={query.isFetching}
        onSearchChange={setSearchInput}
        onSearchCommit={commitSearch}
        onRefresh={refresh}
      />

      {query.isLoading ? <div aria-label={t('admin.directory.loading')} className="h-72 animate-pulse rounded-xl border border-satin bg-surface-raised" /> : null}
      {query.isError ? (
        <div className="space-y-3">
          <Alert variant="error"><AlertDescription>{t(errorKey)}</AlertDescription></Alert>
          {status !== 401 && status !== 403 ? <Button variant="outline" onClick={() => void query.refetch()}>{t('admin.directory.retry')}</Button> : null}
        </div>
      ) : null}
      {query.data && !query.isError ? (
        query.data.items.length === 0 ? (
          <EmptyState variant="no-results" title={t('admin.directory.empty')} description={t('admin.directory.emptyDescription')} />
        ) : (
          <div className="space-y-4">
            <AdminOrganizationsTable items={query.data.items} />
            <AppPagination
              mode="cursor"
              currentPage={pagination.pageNumber}
              pageSize={pagination.pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              itemCount={query.data.items.length}
              itemLabel={t('admin.organizations.itemLabel')}
              hasPreviousPage={pagination.hasPreviousPage}
              hasNextPage={Boolean(nextCursor)}
              isLoading={query.isFetching}
              onPageSizeChange={pagination.changePageSize}
              onPreviousPage={pagination.previous}
              onNextPage={() => pagination.next(nextCursor)}
            />
          </div>
        )
      ) : null}
    </AdminPageShell>
  );
}
