import { Box, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import type { PaymentOrderDetail } from '../types/payment.types';
import { formatVnd } from '../utils/paymentFormat';

interface PaymentOrderDetailSummaryProps {
  order: PaymentOrderDetail;
  statusLabel: string;
  hint: string;
  statusIcon: LucideIcon;
  statusIconWrap: string;
  locale: string;
  isStatusLoading: boolean;
}

export function PaymentOrderDetailSummary({
  order,
  statusLabel,
  hint,
  statusIcon: StatusIcon,
  statusIconWrap,
  locale,
  isStatusLoading,
}: PaymentOrderDetailSummaryProps) {
  const { t } = useLanguage();
  const credits = order.interviewCredits;

  return (
    <aside className="flex flex-col gap-6 rounded-2xl bg-surface-raised p-5 frame-satin sm:p-6">
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span
          className={`flex size-20 items-center justify-center rounded-full ${statusIconWrap}`}
        >
          <StatusIcon className="size-10" aria-hidden />
        </span>
        {isStatusLoading ? (
          <Skeleton className="h-7 w-48" />
        ) : (
          <p className="text-lg font-semibold text-foreground sm:text-xl">{statusLabel}</p>
        )}
        <p className="max-w-[18rem] text-sm text-muted-foreground">{hint}</p>
      </div>

      <div className="space-y-2">
        <p className="text-label text-muted-foreground">{t('payment.orders.selectedPackage')}</p>
        <div className="flex items-center gap-3 rounded-xl bg-surface-overlay px-4 py-3 frame-satin-soft">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-foreground">
            <Box className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {order.packageName ?? order.packageId}
            </p>
            <p className="text-sm text-muted-foreground">
              {credits != null
                ? t('payment.orders.creditCount').replace('{count}', String(credits))
                : t('payment.orders.package')}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-label text-muted-foreground">{t('payment.orders.totalAmount')}</p>
        <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {order.amountVnd != null ? `${formatVnd(order.amountVnd, locale)} VND` : '--'}
        </p>
      </div>

      <p className="mt-auto flex items-center gap-2 pt-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0 text-foreground" aria-hidden />
        {t('payment.orders.payosSecured')}
      </p>
    </aside>
  );
}
