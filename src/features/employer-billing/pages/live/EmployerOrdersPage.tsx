import { useState } from 'react';
import toast from 'react-hot-toast';
import { AppPagination, DEFAULT_PAGE_SIZE } from '@/components/ui/app-pagination';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLanguage } from '@/shared/languages';
import { CancelOrderDialog } from '../../components/live/CancelOrderDialog';
import { OrdersTable } from '../../components/live/OrdersTable';
import { QuerySection } from '../../components/live/QuerySection';
import { useCancelEmployerOrder } from '../../hooks/useEmployerPaymentMutations';
import { useEmployerOrders, useEmployerPackages } from '../../hooks/useEmployerPaymentQueries';
import type { OrderResponse } from '../../types/employerPayment.types';
import { canManageEmployerPayment } from '../../utils/employerPayment';
import { getEmployerPaymentErrorKey, getSafeBackendMessage } from '../../utils/employerPaymentErrors';

export function EmployerOrdersPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const canManage = canManageEmployerPayment(user?.role);
  const [cursor, setCursor] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<string | null>>([]);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selected, setSelected] = useState<OrderResponse | null>(null);
  const orders = useEmployerOrders(cursor, pageSize);
  const packages = useEmployerPackages();
  const cancel = useCancelEmployerOrder();
  const error = cancel.error
    ? getSafeBackendMessage(cancel.error) ?? t(getEmployerPaymentErrorKey(cancel.error, 'cancel'))
    : null;

  const confirmCancel = () => {
    if (!selected || cancel.isPending) return;
    cancel.mutate(selected.id, {
      onSuccess: () => {
        toast.success(t('employerBilling.orders.cancelledToast'));
        setSelected(null);
      },
    });
  };

  return (
    <div className="space-y-4">
      <QuerySection isLoading={orders.isLoading} isError={orders.isError} onRetry={() => void orders.refetch()}>
        <OrdersTable
          orders={orders.data?.data ?? []}
          packages={packages.data}
          canManage={canManage}
          onCancel={setSelected}
        />
      </QuerySection>
      <AppPagination
        mode="cursor"
        currentPage={history.length + 1}
        pageSize={pageSize}
        itemCount={orders.data?.data.length ?? 0}
        itemLabel={t('employerBilling.pagination.orders')}
        hasPreviousPage={history.length > 0}
        hasNextPage={Boolean(orders.data?.nextCursor)}
        isLoading={orders.isFetching}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCursor(null);
          setHistory([]);
        }}
        onPreviousPage={() => {
          setHistory((current) => {
            const next = [...current];
            setCursor(next.pop() ?? null);
            return next;
          });
        }}
        onNextPage={() => {
          if (!orders.data?.nextCursor) return;
          setHistory((current) => [...current, cursor]);
          setCursor(orders.data.nextCursor);
        }}
      />
      <CancelOrderDialog
        open={Boolean(selected)}
        isLoading={cancel.isPending}
        error={error}
        onOpenChange={(open) => {
          if (!open) {
            cancel.reset();
            setSelected(null);
          }
        }}
        onConfirm={confirmCancel}
      />
    </div>
  );
}
