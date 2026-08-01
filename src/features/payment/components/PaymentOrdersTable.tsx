import { Ban, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { PaymentOrderDetail, PaymentOrderStatusResult } from '../types/payment.types';

export function PaymentOrdersTable({ orders, statuses, onCancel, onView, cancellingId, page, pageSize, totalLoaded, hasNextPage, isFetchingNextPage, onPageSizeChange, onPreviousPage, onNextPage }: {
  orders: PaymentOrderDetail[];
  statuses: Record<string, PaymentOrderStatusResult>;
  onCancel: (orderId: string) => void;
  onView?: (order: PaymentOrderDetail) => void;
  cancellingId?: string;
  page: number;
  pageSize: number;
  totalLoaded: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onPageSizeChange: (size: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  if (!orders.length) return <div className="frame-satin rounded-2xl bg-surface-raised p-8 text-center"><p className="font-medium text-foreground">{t('payment.orders.empty')}</p></div>;

  return <div className="space-y-4">
    <div className="overflow-x-auto frame-satin rounded-2xl bg-surface-raised">
    <Table className="min-w-[900px]"><TableHeader><TableRow className="bg-surface-overlay">
      <TableHead>{t('payment.orders.orderCode')}</TableHead>
      <TableHead>{t('payment.orders.kind')}</TableHead>
      <TableHead>{t('payment.orders.package')}</TableHead>
      <TableHead>{t('payment.orders.amount')}</TableHead>
      <TableHead className="whitespace-nowrap">{t('payment.orders.status')}</TableHead>
      <TableHead>{t('payment.orders.createdAt')}</TableHead>
      <TableHead>{t('payment.orders.expiredAt')}</TableHead>
      <TableHead>{t('payment.orders.paidAt')}</TableHead>
      <TableHead className="w-[96px] whitespace-nowrap px-2 text-right">{t('payment.orders.actions')}</TableHead>
    </TableRow></TableHeader><TableBody>
      {orders.map((order) => {
        const status = statuses[order.orderId]?.status ?? order.status;
        const pending = status.toLowerCase() === 'pending' || status === '1';
        return <TableRow key={order.orderId}>
          <TableCell className="font-mono text-xs font-semibold text-foreground">{shortId(order.orderId)}</TableCell>
          <TableCell className="text-muted-foreground">{getKindLabel(order.kind, t)}</TableCell>
          <TableCell className="max-w-52 truncate font-medium text-foreground" title={order.packageName ?? order.packageId}>{order.packageName ?? order.packageId}</TableCell>
          <TableCell>{order.amountVnd == null ? '—' : formatVnd(order.amountVnd)}</TableCell>
          <TableCell className="whitespace-nowrap"><span className={statusClass(status)}>{getStatusLabel(status, t)}</span></TableCell>
          <TableCell>{formatDate(order.createdAt, locale)}</TableCell>
          <TableCell>{formatDate(order.expiredAt ?? null, locale)}</TableCell>
          <TableCell>{formatDate(order.paidAt ?? null, locale)}</TableCell>
          <TableCell className="w-[96px] whitespace-nowrap px-2"><div className="flex items-center justify-end gap-1">{onView ? <button type="button" className="icon-button" title={t('payment.orders.view')} aria-label={t('payment.orders.view')} onClick={() => onView(order)}><Eye className="size-4" aria-hidden /></button> : null}{pending ? <button type="button" className="btn-ghost px-2 text-xs" disabled={cancellingId === order.orderId} onClick={() => onCancel(order.orderId)}><Ban className="mr-1 size-3.5" aria-hidden />{t('payment.orders.cancel')}</button> : null}</div></TableCell>
        </TableRow>;
      })}
    </TableBody></Table>
    </div>
    <div className="frame-satin flex flex-col gap-3 rounded-2xl bg-surface-raised px-3 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <label className="flex items-center gap-2">{t('payment.pagination.show')}<select className="rounded-lg border border-satin bg-surface-overlay px-3 py-1.5 text-foreground" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}><option value={5}>5</option><option value={10}>10</option><option value={25}>25</option></select>{t('payment.pagination.perPage')}</label>
      <span>{t('payment.pagination.pageSummary').replace('{start}', String(totalLoaded ? page * pageSize + 1 : 0)).replace('{end}', String(Math.min((page + 1) * pageSize, totalLoaded))).replace('{count}', String(totalLoaded))}</span>
      <div className="flex items-center gap-2"><button type="button" className="icon-button" disabled={page === 0} onClick={onPreviousPage} aria-label={t('payment.pagination.previous')}><ChevronLeft className="size-4" aria-hidden /></button><span className="font-medium text-foreground">{t('payment.pagination.page').replace('{page}', String(page + 1))}</span><button type="button" className="icon-button" disabled={isFetchingNextPage || (!hasNextPage && (page + 1) * pageSize >= totalLoaded)} onClick={onNextPage} aria-label={t('payment.pagination.next')}><ChevronRight className="size-4" aria-hidden /></button></div>
    </div>
  </div>;
}

function shortId(value: string) { return value.length > 16 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value; }
function formatVnd(value: number) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value); }
function formatDate(value: string | null | undefined, locale: string) { return value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'; }
function getKindLabel(kind: number | undefined, t: (key: string) => string) {
  const key = ({ 0: 'kindCreditPack', 1: 'kindInvoice', 2: 'kindSubscription', 3: 'kindRenewal' } as Record<number, string>)[kind ?? -1];
  return key ? t(`payment.orders.${key}`) : t('payment.orders.kindUnknown');
}
function getStatusLabel(status: string, t: (key: string) => string) {
  const key = ({ '1': 'statusPending', Pending: 'statusPending', '2': 'statusPaid', Paid: 'statusPaid', '3': 'statusFailed', Failed: 'statusFailed', '4': 'statusExpired', Expired: 'statusExpired', '5': 'statusCancelled', Cancelled: 'statusCancelled', Canceled: 'statusCancelled', '6': 'statusRefunded', Refunded: 'statusRefunded' } as Record<string, string>)[status];
  return key ? t(`payment.orders.${key}`) : t('payment.orders.statusUnknown');
}
function statusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'paid' || status === '2') return 'rounded-full border border-success/30 bg-success-bg px-2 py-1 text-xs font-medium text-success';
  if (normalized === 'pending' || status === '1') return 'rounded-full border border-warning/30 bg-warning-bg px-2 py-1 text-xs font-medium text-warning';
  if (normalized === 'failed' || normalized === 'expired' || normalized === 'cancelled' || normalized === 'canceled' || normalized === 'refunded' || ['3', '4', '5', '6'].includes(status)) return 'rounded-full border border-error/30 bg-error-bg px-2 py-1 text-xs font-medium text-error';
  return 'rounded-full border border-subtle bg-surface-overlay px-2 py-1 text-xs font-medium text-muted-foreground';
}
