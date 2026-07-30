import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
      <p className="rounded-xl border border-satin bg-surface-raised px-4 py-8 text-center text-sm text-muted-foreground">
        {t('payment.orders.empty')}
      </p>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('payment.orders.createdAt')}</TableHead>
              <TableHead>{t('payment.orders.package')}</TableHead>
              <TableHead>{t('payment.orders.amount')}</TableHead>
              <TableHead>{t('payment.orders.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const status = resolveRowStatus(order, statuses);
              const hasLiveStatus = Boolean(statuses[order.orderId]);
              return (
                <TableRow
                  key={order.orderId}
                  className="cursor-pointer"
                  onClick={() => onSelectOrder(order.orderId)}
                >
                  <TableCell>
                    {order.createdAt ? formatPaymentDate(order.createdAt, language) : '-'}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {order.packageName ?? order.packageId}
                  </TableCell>
                  <TableCell>
                    {order.priceVnd ? `${formatVnd(order.priceVnd, locale)} VND` : '-'}
                  </TableCell>
                  <TableCell>
                    {!hasLiveStatus && isStatusesLoading ? (
                      <Skeleton className="h-6 w-28 rounded-full" />
                    ) : (
                      <Badge variant="outline" className={getLiveStatusBadgeClass(status)}>
                        {t(livePaymentStatusLabelKey(status))}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
                'frame-satin w-full rounded-xl bg-surface-raised p-4 text-left transition hover:bg-surface-overlay',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
              )}
              onClick={() => onSelectOrder(order.orderId)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">
                    {order.packageName ?? order.packageId}
                  </p>
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
