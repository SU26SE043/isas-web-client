import { ArrowLeft, Copy } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/shared/languages';
import { PaymentQuerySection } from '../components/PaymentQuerySection';
import { useCancelPaymentOrder } from '../hooks/useMyPaymentOrders';
import { paymentKeys } from '../hooks/useMyPaymentOrders';
import { paymentService } from '../services/payment.service';
import type { PaymentOrderDetail } from '../types/payment.types';

export function PaymentOrderDetailPage() {
  const { orderId = '' } = useParams();
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const order = useQuery({ queryKey: paymentKeys.order(orderId), queryFn: () => paymentService.fetchOrderDetail(orderId), enabled: Boolean(orderId), retry: false });
  const cancel = useCancelPaymentOrder();
  const pending = order.data ? ['pending', '1'].includes(order.data.status.toLowerCase()) : false;

  return <div className="h-full overflow-y-auto bg-surface-base"><div className="page-container page-section mx-auto max-w-3xl space-y-5">
    <Link to="/candidate/credits" className="btn-ghost inline-flex items-center gap-2"><ArrowLeft className="size-4" aria-hidden />{t('payment.orders.backToOrders')}</Link>
    <PaymentQuerySection isLoading={order.isLoading} isError={order.isError || !order.data} errorMessage={t('payment.orders.loadError')} onRetry={() => void order.refetch()}>
      {order.data ? <OrderDetail order={order.data} locale={locale} pending={pending} cancelling={cancel.isPending} onCancel={() => cancel.mutate(order.data!.orderId)} t={t} /> : null}
    </PaymentQuerySection>
  </div></div>;
}

function OrderDetail({ order, locale, pending, cancelling, onCancel, t }: { order: PaymentOrderDetail; locale: string; pending: boolean; cancelling: boolean; onCancel: () => void; t: (key: string) => string }) {
  return <><section className="frame-satin rounded-2xl bg-surface-raised p-6"><div className="flex items-start justify-between gap-4 border-b border-satin pb-5"><div><p className="text-label">{t('payment.orders.detailTitle')}</p><h1 className="mt-2 text-2xl font-semibold text-foreground">{order.packageName ?? order.packageId}</h1></div><Status status={order.status} t={t} /></div><dl className="mt-3">{row(t('payment.orders.orderCode'), order.orderId, true)}{row(t('payment.orders.package'), order.packageName ?? order.packageId)}{row(t('payment.orders.amount'), order.amountVnd == null ? '—' : formatVnd(order.amountVnd))}{row(t('payment.orders.createdAt'), formatDate(order.createdAt, locale))}{row(t('payment.orders.expiredAt'), formatDate(order.expiredAt, locale))}{row(t('payment.orders.paidAt'), formatDate(order.paidAt, locale))}</dl></section>{pending ? <button type="button" className="btn-secondary" disabled={cancelling} onClick={onCancel}>{t('payment.orders.cancel')}</button> : null}</>;
}

function row(label: string, value: string, copy = false) { return <div className="flex flex-col gap-1 border-b border-satin/60 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="flex items-center gap-2 text-sm font-medium text-foreground">{value}{copy ? <button type="button" className="icon-button" title={value} onClick={() => void navigator.clipboard.writeText(value)}><Copy className="size-3.5" aria-hidden /></button> : null}</dd></div>; }
function formatVnd(value: number) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value); }
function formatDate(value: string | null | undefined, locale: string) { return value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'; }
function Status({ status, t }: { status: string; t: (key: string) => string }) { const normalized = status.toLowerCase(); const key = ({ '1': 'statusPending', pending: 'statusPending', '2': 'statusPaid', paid: 'statusPaid', '3': 'statusFailed', failed: 'statusFailed', '4': 'statusExpired', expired: 'statusExpired', '5': 'statusCancelled', cancelled: 'statusCancelled', canceled: 'statusCancelled', '6': 'statusRefunded', refunded: 'statusRefunded' } as Record<string, string>)[normalized] ?? 'statusUnknown'; return <span className={normalized === 'paid' || normalized === '2' ? 'rounded-full border border-success/30 bg-success-bg px-3 py-1 text-xs font-medium text-success' : normalized === 'pending' || normalized === '1' ? 'rounded-full border border-warning/30 bg-warning-bg px-3 py-1 text-xs font-medium text-warning' : 'rounded-full border border-error/30 bg-error-bg px-3 py-1 text-xs font-medium text-error'}>{t(`payment.orders.${key}`)}</span>; }
