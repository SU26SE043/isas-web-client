import { useState, type ReactNode } from 'react';
import {
  Calendar,
  Copy,
  Hash,
  Package,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import type { PaymentOrderDetail, PaymentOrderStatusResult } from '../types/payment.types';
import { formatPaymentDate, formatVnd } from '../utils/paymentFormat';
import {
  getLiveStatusBadgeClass,
  livePaymentStatusLabelKey,
} from '../utils/livePaymentStatus';

interface PaymentOrderDetailFieldsProps {
  order: PaymentOrderDetail;
  status: string;
  statusResult?: PaymentOrderStatusResult;
  isStatusLoading: boolean;
  locale: string;
  language: string;
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-subtle py-3.5 last:border-b-0">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-overlay text-muted-foreground">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-1 text-sm text-foreground">{children}</div>
      </div>
    </div>
  );
}

function CopyableValue({ value, label }: { value: string; label: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="min-w-0 flex-1 break-all font-medium">{value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0"
        aria-label={copied ? t('payment.orders.copied') : `${t('payment.orders.copy')} ${label}`}
        onClick={() => void handleCopy()}
      >
        <Copy className="size-4" aria-hidden />
      </Button>
    </div>
  );
}

export function PaymentOrderDetailFields({
  order,
  status,
  statusResult,
  isStatusLoading,
  locale,
  language,
}: PaymentOrderDetailFieldsProps) {
  const { t } = useLanguage();
  const orderCode =
    statusResult?.orderCode != null ? String(statusResult.orderCode) : null;
  const paidAt = statusResult?.paidAt ?? order.paidAt;

  return (
    <div className="rounded-2xl bg-surface-raised px-4 py-2 frame-satin sm:px-5">
      <DetailRow icon={Hash} label={t('payment.result.orderId')}>
        <CopyableValue value={order.orderId} label={t('payment.result.orderId')} />
      </DetailRow>

      <DetailRow icon={Wallet} label={t('payment.orders.orderCode')}>
        {isStatusLoading && !orderCode ? (
          <Skeleton className="h-5 w-40" />
        ) : orderCode ? (
          <CopyableValue value={orderCode} label={t('payment.orders.orderCode')} />
        ) : (
          <span className="text-muted-foreground">--</span>
        )}
      </DetailRow>

      <DetailRow icon={Package} label={t('payment.orders.status')}>
        {isStatusLoading && !status ? (
          <Skeleton className="h-6 w-36 rounded-full" />
        ) : (
          <Badge variant="outline" className={getLiveStatusBadgeClass(status)}>
            <span className="size-1.5 rounded-full bg-current" aria-hidden />
            {t(livePaymentStatusLabelKey(status))}
          </Badge>
        )}
      </DetailRow>

      <DetailRow icon={Calendar} label={t('payment.orders.createdAt')}>
        {order.createdAt ? formatPaymentDate(order.createdAt, language) : '--'}
      </DetailRow>

      <DetailRow icon={Wallet} label={t('payment.orders.amount')}>
        {order.priceVnd != null ? `${formatVnd(order.priceVnd, locale)} VND` : '--'}
      </DetailRow>

      <DetailRow icon={Package} label={t('payment.orders.package')}>
        {order.packageName ?? order.packageId}
      </DetailRow>

      <DetailRow icon={Calendar} label={t('payment.result.paidAt')}>
        {paidAt ? formatPaymentDate(paidAt, language) : '--'}
      </DetailRow>
    </div>
  );
}
