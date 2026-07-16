import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { PaymentOrderDetail, PaymentOrderStatusResult } from '../types/payment.types';
import { formatPaymentDate, formatVnd } from '../utils/paymentFormat';
import {
  getLiveStatusBadgeClass,
  livePaymentStatusLabelKey,
  normalizeLivePaymentStatus,
} from '../utils/livePaymentStatus';

interface PaymentOrdersTableProps {
  orders: PaymentOrderDetail[];
  statuses: Record<string, PaymentOrderStatusResult>;
  isStatusesLoading: boolean;
  onSelectOrder: (orderId: string) => void;
}

function resolveRowStatus(
  order: PaymentOrderDetail,
  statuses: Record<string, PaymentOrderStatusResult>,
): string {
  const live = statuses[order.orderId]?.status;
  if (live) return normalizeLivePaymentStatus(live);
  return normalizeLivePaymentStatus(order.paymentStatus ?? order.orderStatus ?? order.status);
}

export function PaymentOrdersTable({
  orders,
  statuses,
  isStatusesLoading,
  onSelectOrder,
}: PaymentOrdersTableProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-subtle bg-surface-raised px-4 py-8 text-center text-sm text-muted-foreground">
        {t('payment.orders.empty')}
      </p>
    );
  }

  return (
    <>
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
              const status = resolveRowStatus(order, statuses);
              const hasLiveStatus = Boolean(statuses[order.orderId]);
              return (
                <tr
                  key={order.orderId}
                  className="cursor-pointer border-b border-subtle transition last:border-b-0 hover:bg-surface-overlay"
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
                    {!hasLiveStatus && isStatusesLoading ? (
                      <Skeleton className="h-6 w-28 rounded-full" />
                    ) : (
                      <Badge variant="outline" className={getLiveStatusBadgeClass(status)}>
                        {t(livePaymentStatusLabelKey(status))}
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {orders.map((order) => {
          const status = resolveRowStatus(order, statuses);
          const hasLiveStatus = Boolean(statuses[order.orderId]);
          return (
            <button
              key={order.orderId}
              type="button"
              className={cn(
                'w-full rounded-xl border border-subtle bg-surface-raised p-4 text-left transition hover:bg-surface-overlay',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
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
                {!hasLiveStatus && isStatusesLoading ? (
                  <Skeleton className="h-6 w-24 rounded-full" />
                ) : (
                  <Badge variant="outline" className={getLiveStatusBadgeClass(status)}>
                    {t(livePaymentStatusLabelKey(status))}
                  </Badge>
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {order.priceVnd ? `${formatVnd(order.priceVnd, locale)} VND` : '-'}
              </p>
            </button>
          );
        })}
      </div>
    </>
  );
}
