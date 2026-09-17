import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppPagination } from '@/components/ui/app-pagination';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/patterns/EmptyState';
import { getApiStatusCode } from '@/shared/api/apiError';
import { useLanguage } from '@/shared/languages';
import { AdminPageShell } from '../components/AdminPageShell';
import { AdminOrdersTable } from '../components/orders/AdminOrdersTable';
import { AdminOrdersToolbar, type OrderFilters } from '../components/orders/AdminOrdersToolbar';
import { useAdminOrders } from '../hooks/useAdminOrders';
import { useAdminOrgNameMap } from '../hooks/useAdminOrgOptions';
import { useDirectoryCursor } from '../hooks/useDirectoryCursor';
import { ORDER_STATUS_REFUNDED } from '../utils/adminBilling';

const PAGE_SIZE_OPTIONS = [20, 50, 100, 500] as const;

/**
 * Đơn hàng — chỉ xem (phạm vi user chốt 2026-09-16). Đổi filter ⇒ về trang đầu (cursor cũ thuộc tập khác).
 * Endpoint có từ DB8 nhưng FE = 0 caller suốt 2 tháng; hoàn tiền vẫn làm qua API (ghi rõ dưới bảng).
 */
export function AdminOrdersPage() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<OrderFilters>({});
  const pagination = useDirectoryCursor();
  const { names } = useAdminOrgNameMap();
  const query = useAdminOrders({ ...filters, ...(pagination.currentCursor ? { cursor: pagination.currentCursor } : {}), limit: pagination.pageSize });
  const nextCursor = query.data?.nextCursor ?? null;
  const changeFilters = (next: OrderFilters) => { setFilters(next); pagination.reset(); };
  const status = getApiStatusCode(query.error);
  const errorKey = status === 401 ? 'admin.directory.errors.unauthorized' : status === 403 ? 'admin.directory.errors.forbidden' : 'admin.orders.errors.load';

  return (
    <AdminPageShell title={t('admin.orders.title')} description={t('admin.orders.description')} actions={query.data ? <p className="text-sm text-muted-foreground">{t('admin.directory.pageCount').replace('{count}', String(query.data.items.length))}</p> : null}>
      <AdminOrdersToolbar filters={filters} isFetching={query.isFetching} onChange={changeFilters} onRefresh={() => void query.refetch()} />
      {query.isLoading ? <div aria-label={t('admin.directory.loading')} className="h-72 animate-pulse rounded-xl border border-satin bg-surface-raised" /> : null}
      {query.isError ? <div className="space-y-3"><Alert variant="error"><AlertDescription>{t(errorKey)}</AlertDescription></Alert>{status !== 401 && status !== 403 ? <Button variant="outline" onClick={() => void query.refetch()}>{t('admin.directory.retry')}</Button> : null}</div> : null}
      {query.data && !query.isError ? (
        query.data.items.length === 0 ? <EmptyState variant="no-results" title={t('admin.orders.empty')} description={t('admin.orders.emptyDescription')} /> : (
          <div className="space-y-4">
            <div className="overflow-x-auto"><AdminOrdersTable items={query.data.items} names={names} showRefund={filters.status === ORDER_STATUS_REFUNDED} /></div>
            <AppPagination mode="cursor" currentPage={pagination.pageNumber} pageSize={pagination.pageSize} pageSizeOptions={PAGE_SIZE_OPTIONS} itemCount={query.data.items.length} itemLabel={t('admin.orders.itemLabel')} hasPreviousPage={pagination.hasPreviousPage} hasNextPage={Boolean(nextCursor)} isLoading={query.isFetching} onPageSizeChange={pagination.changePageSize} onPreviousPage={pagination.previous} onNextPage={() => pagination.next(nextCursor)} />
          </div>
        )
      ) : null}
      <p className="text-xs text-muted-foreground">{t('admin.orders.readOnlyNote')}</p>
    </AdminPageShell>
  );
}
