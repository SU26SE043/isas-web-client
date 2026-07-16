import { RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { PaymentOrderDetail, PaymentOrderStatusResult } from '../types/payment.types';
import { formatPaymentDate, formatVnd } from '../utils/paymentFormat';

interface PaymentOrdersTableProps {
  orders: PaymentOrderDetail[];
  selectedOrderId: string | null;
  statusResult?: PaymentOrderStatusResult;
  isStatusLoading: boolean;
  isCanceling: boolean;
  cancelError?: string | null;
  onSelectOrder: (orderId: string) => void;
  onRefreshStatus: () => void;
  onCancelOrder: (orderId: string) => void;
}

function getDisplayStatus(order: PaymentOrderDetail, statusResult?: PaymentOrderStatusResult): string {
  if (statusResult) return statusResult.status;
  return order.orderStatus ?? order.paymentStatus ?? order.status;
}

function isPending(status: string): boolean {
  return status.trim().toLowerCase() === 'pending';
}

function getStatusClass(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (normalized === 'paid') return 'border-success/30 bg-success-bg text-success';
  if (normalized === 'failed' || normalized === 'expired') return 'border-error/30 bg-error-bg text-error';
  if (normalized === 'cancelled' || normalized === 'canceled') {
    return 'border-warning/30 bg-warning-bg text-warning';
  }
  return 'border-subtle bg-surface-overlay text-foreground';
}

export function PaymentOrdersTable({
  orders,
  selectedOrderId,
  statusResult,
  isStatusLoading,
  isCanceling,
  cancelError,
  onSelectOrder,
  onRefreshStatus,
  onCancelOrder,
}: PaymentOrdersTableProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const selectedOrder = orders.find((order) => order.orderId === selectedOrderId) ?? null;
  const selectedStatus = selectedOrder ? getDisplayStatus(selectedOrder, statusResult) : '';

  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-subtle bg-surface-raised px-4 py-8 text-center text-sm text-muted-foreground">
        {t('payment.orders.empty')}
      </p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="hidden overflow-hidden rounded-xl border border-subtle bg-surface-raised md:block">
        <table className="min-w-full text-sm">
          <thead className="border-b border-subtle bg-surface-base text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">{t('payment.orders.createdAt')}</th>
              <th className="px-4 py-3">{t('payment.orders.package')}</th>
              <th className="px-4 py-3">{t('payment.orders.amount')}</th>
              <th className="px-4 py-3">{t('payment.orders.status')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const active = order.orderId === selectedOrderId;
              const status = getDisplayStatus(order, active ? statusResult : undefined);
              return (
                <tr
                  key={order.orderId}
                  className={cn(
                    'cursor-pointer border-b border-subtle transition last:border-b-0 hover:bg-surface-overlay',
                    active && 'bg-surface-elevated',
                  )}
                  onClick={() => onSelectOrder(order.orderId)}
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.createdAt ? formatPaymentDate(order.createdAt, language) : '-'}
                  </td>
                  <td className="px-4 py-3 text-foreground">{order.packageName ?? order.packageId}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.priceVnd ? `${formatVnd(order.priceVnd, locale)} VND` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={getStatusClass(status)}>
                      {status}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {orders.map((order) => {
          const active = order.orderId === selectedOrderId;
          const status = getDisplayStatus(order, active ? statusResult : undefined);
          return (
            <button
              key={order.orderId}
              type="button"
              className={cn(
                'w-full rounded-xl border border-subtle bg-surface-raised p-4 text-left transition hover:bg-surface-overlay focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
                active && 'bg-surface-elevated',
              )}
              onClick={() => onSelectOrder(order.orderId)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{order.packageName ?? order.packageId}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.createdAt ? formatPaymentDate(order.createdAt, language) : '-'}
                  </p>
                </div>
                <Badge variant="outline" className={getStatusClass(status)}>
                  {status}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {order.priceVnd ? `${formatVnd(order.priceVnd, locale)} VND` : '-'}
              </p>
            </button>
          );
        })}
      </div>

      <aside className="rounded-xl border border-subtle bg-surface-raised p-4">
        <h3 className="text-sm font-semibold text-foreground">{t('payment.orders.detailTitle')}</h3>
        {selectedOrder ? (
          <div className="mt-4 space-y-4">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">{t('payment.result.orderId')}</dt>
                <dd className="mt-1 break-all text-foreground">{selectedOrder.orderId}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('payment.orders.orderCode')}</dt>
                <dd className="mt-1 text-foreground">{statusResult?.orderCode || '-'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('payment.orders.status')}</dt>
                <dd className="mt-1">
                  <Badge variant="outline" className={getStatusClass(selectedStatus)}>
                    {isStatusLoading ? t('payment.orders.polling') : selectedStatus}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('payment.result.paidAt')}</dt>
                <dd className="mt-1 text-foreground">
                  {statusResult?.paidAt ? formatPaymentDate(statusResult.paidAt, language) : '-'}
                </dd>
              </div>
            </dl>
            {cancelError ? (
              <p className="rounded-lg border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
                {cancelError}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={onRefreshStatus} disabled={isStatusLoading}>
                <RefreshCw className={cn('size-4', isStatusLoading && 'animate-spin')} aria-hidden />
                {t('payment.orders.refresh')}
              </Button>
              <Button
                type="button"
                variant="destructive"
                loading={isCanceling}
                disabled={!isPending(selectedStatus)}
                onClick={() => onCancelOrder(selectedOrder.orderId)}
              >
                <Trash2 className="size-4" aria-hidden />
                {t('payment.orders.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">{t('payment.orders.selectHint')}</p>
        )}
      </aside>
    </div>
  );
}
