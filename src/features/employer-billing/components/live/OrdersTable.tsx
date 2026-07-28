import { Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { OrderResponse, PackageResponse } from '../../types/employerPayment.types';
import { PaymentOrderStatus } from '../../types/employerPayment.types';
import { formatDateTime, formatVnd, statusTextFromEnum, truncateId } from '../../utils/employerPayment';
import { orderKindLabelKey } from '../../utils/employerPaymentLabels';
import { OrderStatusBadge } from './OrderStatusBadge';

export function OrdersTable({
  orders,
  packages,
  canManage,
  onCancel,
}: {
  orders: OrderResponse[];
  packages?: PackageResponse[];
  canManage: boolean;
  onCancel?: (order: OrderResponse) => void;
}) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const names = new Map(packages?.map((item) => [item.id, item.name]) ?? []);

  if (!orders.length) {
    return (
      <div className="frame-satin rounded-2xl bg-surface-raised p-8 text-center">
        <p className="font-medium text-foreground">{t('employerBilling.live.emptyOrders')}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t('employerBilling.live.emptyOrdersHint')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('employerBilling.orders.code')}</TableHead>
              <TableHead>{t('employerBilling.orders.kind')}</TableHead>
              <TableHead>{t('employerBilling.orders.package')}</TableHead>
              <TableHead>{t('employerBilling.orders.amount')}</TableHead>
              <TableHead>{t('employerBilling.orders.status')}</TableHead>
              <TableHead>{t('employerBilling.orders.createdAt')}</TableHead>
              <TableHead className="text-right">{t('employerBilling.orders.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} packageName={order.packageId ? names.get(order.packageId) : undefined} canManage={canManage} onCancel={onCancel} locale={locale} t={t} />
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-3 md:hidden">
        {orders.map((order) => (
          <article key={order.id} className="frame-satin rounded-xl bg-surface-raised p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{names.get(order.packageId ?? '') ?? t('employerBilling.orders.packageFallback')}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t(orderKindLabelKey(order.kind))}</p>
              </div>
              <OrderStatusBadge status={statusTextFromEnum(order.status)} />
            </div>
            <p className="mt-4 text-xl font-semibold text-foreground">{formatVnd(order.amountVnd, locale)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(order.createdAt, locale)}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" render={<Link to={`/employer/billing/orders/${order.id}`} />} nativeButton={false}>
                <Eye /> {t('employerBilling.orders.view')}
              </Button>
              {canManage && order.status === PaymentOrderStatus.Pending && onCancel ? (
                <Button variant="destructive" onClick={() => onCancel(order)}>
                  <Trash2 /> {t('employerBilling.orders.cancel')}
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function OrderRow({ order, packageName, canManage, onCancel, locale, t }: {
  order: OrderResponse;
  packageName?: string;
  canManage: boolean;
  onCancel?: (order: OrderResponse) => void;
  locale: string;
  t: (key: string) => string;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium text-foreground">{order.payosOrderCode || truncateId(order.id)}</TableCell>
      <TableCell>{t(orderKindLabelKey(order.kind))}</TableCell>
      <TableCell>{packageName ?? (order.packageId ? t('employerBilling.orders.packageFallback') : '—')}</TableCell>
      <TableCell>{formatVnd(order.amountVnd, locale)}</TableCell>
      <TableCell><OrderStatusBadge status={statusTextFromEnum(order.status)} /></TableCell>
      <TableCell>{formatDateTime(order.createdAt, locale)}</TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon-sm" render={<Link to={`/employer/billing/orders/${order.id}`} />} nativeButton={false} aria-label={t('employerBilling.orders.view')}><Eye /></Button>
          {canManage && order.status === PaymentOrderStatus.Pending && onCancel ? (
            <Button variant="destructive" size="icon-sm" onClick={() => onCancel(order)} aria-label={t('employerBilling.orders.cancel')}><Trash2 /></Button>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}
