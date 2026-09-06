import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { PaymentOrderDetail } from '../../types/payment.types';
import { formatPaymentDate, formatVnd } from '../../utils/paymentFormat';
import { getOrderPaymentStatus, resolvePaymentOutcome } from '../../utils/paymentOrderOutcome';

interface DetailRow {
  label: string;
  value: string;
  emphasize?: boolean;
}

type DetailVariant = 'success' | 'failed';

function statusBadgeClass(status: string): string {
  const outcome = resolvePaymentOutcome(status);
  if (outcome === 'success') return 'border-success/30 bg-success-bg text-success';
  if (outcome === 'failed') return 'border-error/30 bg-error-bg text-error';
  return 'border-satin bg-surface-elevated text-text-secondary';
}

function buildDetailRows(
  order: PaymentOrderDetail,
  variant: DetailVariant,
  locale: string,
  t: (key: string) => string,
): DetailRow[] {
  const rows: DetailRow[] = [{ label: t('payment.result.orderId'), value: order.orderId }];


  if (order.amountVnd != null && order.amountVnd > 0) {
    rows.push({
      label: t('payment.result.amount'),
      value: `${formatVnd(order.amountVnd, locale)} VND`,
    });
  }

  if (variant === 'success') {
    if (order.paidAt) {
      rows.push({
        label: t('payment.result.paidAt'),
        value: formatPaymentDate(order.paidAt, locale),
      });
    }
  }

  return rows;
}

interface PaymentOrderDetailCardProps {
  order: PaymentOrderDetail;
  variant: DetailVariant;
}

export function PaymentOrderDetailCard({ order, variant }: PaymentOrderDetailCardProps) {
  const { t, language } = useLanguage();
  const rows = buildDetailRows(order, variant, language, t);
  const paymentStatus = getOrderPaymentStatus(order);

  return (
    <section
      aria-label={t('payment.result.orderCardLabel')}
      className="space-y-4 rounded-xl bg-surface-overlay p-4 frame-satin sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-text-primary">{t('payment.result.orderCardTitle')}</h2>
        {paymentStatus ? (
          <span
            className={cn(
              'inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium',
              statusBadgeClass(paymentStatus),
            )}
          >
            {paymentStatus}
          </span>
        ) : null}
      </div>

      <dl className="divide-y divide-[color:var(--satin-border)]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
          >
            <dt className="text-label text-text-secondary">{row.label}</dt>
            <dd
              className={cn(
                'break-all text-sm font-medium text-text-primary sm:max-w-[62%] sm:text-right',
                row.emphasize && 'font-semibold',
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
