import React from 'react';
import { useLanguage } from '@/shared/languages';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CatalogPackagesGrid } from '../components/CatalogPackagesGrid';
import { PaymentOrdersTable } from '../components/PaymentOrdersTable';
import { PaymentOrderDetailDialog } from '../components/PaymentOrderDetailDialog';
import {
  resolveCancelOrderErrorMessage,
  resolveOrdersErrorMessage,
  useCancelPaymentOrder,
  useMyPaymentOrders,
  usePaymentOrderStatus,
} from '../hooks/useMyPaymentOrders';
import { usePurchasePackage } from '../hooks/usePurchasePackage';

export const CreditsWalletPage: React.FC = () => {
  const { t } = useLanguage();
  usePageTitle(t('payment.transactions.pageTitle'));

  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const ordersQuery = useMyPaymentOrders();
  const detailStatusQuery = usePaymentOrderStatus(selectedOrderId, detailOpen);
  const cancelOrder = useCancelPaymentOrder();
  const {
    purchasePackage,
    isPurchasing,
    error: purchaseError,
    clearError: clearPurchaseError,
  } = usePurchasePackage();

  const orders = ordersQuery.data?.orders ?? [];
  const statuses = ordersQuery.data?.statuses ?? {};
  const selectedOrder = orders.find((order) => order.orderId === selectedOrderId) ?? null;
  const mergedStatus = detailStatusQuery.data ?? (selectedOrderId ? statuses[selectedOrderId] : undefined);

  const openOrderDetail = (orderId: string) => {
    cancelOrder.reset();
    clearPurchaseError();
    setSelectedOrderId(orderId);
    setDetailOpen(true);
  };

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-6xl space-y-8">
        <header className="space-y-2">
          <h1 className="heading-primary text-3xl text-foreground">{t('payment.transactions.pageTitle')}</h1>
          <p className="body-text text-sm text-muted-foreground">{t('payment.transactions.pageSubtitle')}</p>
        </header>

        <section className="space-y-3">
          <div>
            <h2 className="heading-secondary text-xl text-foreground">{t('payment.plans.oneTime')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('payment.plans.sectionSubtitle')}</p>
          </div>
          <CatalogPackagesGrid showEnterpriseCard={false} />
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="heading-secondary text-xl text-foreground">{t('payment.orders.title')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('payment.orders.subtitle')}</p>
          </div>

          {ordersQuery.isLoading ? (
            <div className="space-y-3 rounded-xl border border-subtle bg-surface-raised p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-2/3" />
            </div>
          ) : null}

          {ordersQuery.isError ? (
            <EmptyState
              variant="no-data"
              title={t('payment.orders.loadErrorTitle')}
              description={resolveOrdersErrorMessage(ordersQuery.error, t)}
              action={
                <Button type="button" onClick={() => void ordersQuery.refetch()}>
                  {t('payment.result.retry')}
                </Button>
              }
            />
          ) : null}

          {!ordersQuery.isLoading && !ordersQuery.isError ? (
            <PaymentOrdersTable
              orders={orders}
              statuses={statuses}
              isStatusesLoading={ordersQuery.isFetching}
              onSelectOrder={openOrderDetail}
            />
          ) : null}
        </section>
      </div>

      <PaymentOrderDetailDialog
        open={detailOpen}
        order={selectedOrder}
        statusResult={mergedStatus}
        isStatusLoading={detailStatusQuery.isFetching}
        isCanceling={cancelOrder.isPending}
        isProceeding={isPurchasing}
        cancelError={cancelOrder.error ? resolveCancelOrderErrorMessage(cancelOrder.error, t) : null}
        proceedError={purchaseError}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            cancelOrder.reset();
            clearPurchaseError();
          }
        }}
        onRefreshStatus={() => void detailStatusQuery.refetch()}
        onProceedPayment={() => {
          if (!selectedOrder?.packageId) return;
          clearPurchaseError();
          void purchasePackage(selectedOrder.packageId);
        }}
        onCancelOrder={() => {
          if (!selectedOrderId) return;
          cancelOrder.mutate(selectedOrderId, {
            onSuccess: () => {
              void detailStatusQuery.refetch();
            },
          });
        }}
      />
    </div>
  );
};
