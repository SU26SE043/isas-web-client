import { useLanguage } from '@/shared/languages';
import type { PaymentOrderDetail } from '../../types/payment.types';
import { formatPaymentDate, formatVnd } from '../../utils/paymentFormat';

interface DetailRow {
  label: string;
  value: string;
}

function buildDetailRows(order: PaymentOrderDetail, locale: string, t: (key: string) => string): DetailRow[] {
  const rows: DetailRow[] = [
    { label: t('payment.result.orderId'), value: order.orderId },
  ];

  if (order.paymentStatus) {
    rows.push({
      label: t('payment.result.paymentStatus'),
      value: order.paymentStatus,
    });
  }

  if (order.orderStatus) {
    rows.push({
      label: t('payment.result.orderStatus'),
      value: order.orderStatus,
    });
  } else if (order.status) {
    rows.push({
      label: t('payment.result.orderStatus'),
      value: order.status,
    });
  }

  if (order.packageName) {
    rows.push({
      label: t('payment.result.packageName'),
      value: order.packageName,
    });
  }

  if (order.priceVnd != null && order.priceVnd > 0) {
    rows.push({
      label: t('payment.result.amount'),
      value: `${formatVnd(order.priceVnd, locale)} VND`,
    });
  }

  if (order.interviewCredits != null && order.interviewCredits > 0) {
    rows.push({
      label: t('payment.result.credits'),
      value: t('payment.plans.tokenCount').replace('{count}', String(order.interviewCredits)),
    });
  }

  if (order.paidAt) {
    rows.push({
      label: t('payment.result.paidAt'),
      value: formatPaymentDate(order.paidAt, locale),
    });
  } else if (order.createdAt) {
    rows.push({
      label: t('payment.result.createdAt'),
      value: formatPaymentDate(order.createdAt, locale),
    });
  }

  if (order.paymentMethod) {
    rows.push({
      label: t('payment.result.paymentMethod'),
      value: order.paymentMethod,
    });
  }

  if (order.transactionId) {
    rows.push({
      label: t('payment.result.transactionId'),
      value: order.transactionId,
    });
  }

  return rows;
}

interface PaymentOrderDetailCardProps {
  order: PaymentOrderDetail;
}

export function PaymentOrderDetailCard({ order }: PaymentOrderDetailCardProps) {
  const { t, language } = useLanguage();
  const rows = buildDetailRows(order, language, t);

  return (
    <section
      aria-label={t('payment.result.orderCardLabel')}
      className="space-y-3 rounded-xl border border-subtle bg-surface-overlay p-4"
    >
      <h2 className="text-sm font-semibold text-foreground">{t('payment.result.orderCardTitle')}</h2>
      <dl className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{row.label}</dt>
            <dd className="text-sm font-medium text-foreground sm:max-w-[60%] sm:text-right">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
