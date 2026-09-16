import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { AdminOrder } from '../../types/adminApi.types';
import { OWNER_TYPE_ORG, formatVnd, orderKindKey, orderStatusKey, ownerTypeKey, payoutStatusKey, shortId } from '../../utils/adminBilling';

const statusVariant = (status: number) => (status === 2 ? 'success' : status === 6 ? 'info' : status === 1 ? 'warning' : status === 3 ? 'destructive' : 'outline');

/**
 * Bảng đơn hàng CHỈ XEM (user chốt: hoàn tiền/chuyển tiền vẫn đi API, chưa lên giao diện). Với đơn đã hoàn
 * hiện cột chuyển tiền: `refundSettledAt` có ⇒ đã chuyển; chưa có mà `payoutStatus=Failed` ⇒ ca gấp nhất
 * (tiền có thể đã rời tài khoản mà khách chưa nhận) — nêu lý do ngay trên bảng, không để trong log.
 */
export function AdminOrdersTable({ items, names, showRefund }: { items: AdminOrder[]; names: Map<string, string>; showRefund: boolean }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const when = (iso: string | null | undefined) => (iso ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)) : '—');
  const owner = (order: AdminOrder) => `${t(ownerTypeKey(order.ownerType))} · ${order.ownerType === OWNER_TYPE_ORG ? names.get(order.ownerId) ?? shortId(order.ownerId) : shortId(order.ownerId)}`;

  return (
    <Table className="min-w-[960px]" aria-label={t('admin.orders.title')}>
      <TableHeader><TableRow>
        <TableHead>{t('admin.orders.table.createdAt')}</TableHead><TableHead>{t('admin.orders.table.owner')}</TableHead><TableHead>{t('admin.orders.table.kind')}</TableHead>
        <TableHead className="text-right">{t('admin.orders.table.amount')}</TableHead><TableHead>{t('admin.orders.table.status')}</TableHead><TableHead>{t('admin.orders.table.paidAt')}</TableHead><TableHead>{t('admin.orders.table.payos')}</TableHead>
        {showRefund ? <TableHead>{t('admin.orders.table.refund')}</TableHead> : null}
      </TableRow></TableHeader>
      <TableBody>
        {items.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="whitespace-nowrap">{when(order.createdAt)}</TableCell>
            <TableCell>{owner(order)}</TableCell>
            <TableCell>{t(orderKindKey(order.kind))}</TableCell>
            <TableCell className="text-right tabular-nums">{formatVnd(order.amountVnd, locale)}</TableCell>
            <TableCell><Badge variant={statusVariant(order.status)}>{t(orderStatusKey(order.status))}</Badge></TableCell>
            <TableCell className="whitespace-nowrap">{when(order.paidAt)}</TableCell>
            <TableCell className="font-mono text-xs">{order.payosOrderCode}</TableCell>
            {showRefund ? (
              <TableCell className="space-y-1 text-xs">
                <p>{t('admin.orders.refund.at')} {when(order.refundedAt)}{order.refundReason ? ` · ${order.refundReason}` : ''}</p>
                {order.refundSettledAt ? <Badge variant="success">{t('admin.orders.refund.settled').replace('{when}', when(order.refundSettledAt))}</Badge>
                  : order.payoutStatus === 'Failed' ? <Badge variant="destructive">{t(payoutStatusKey('Failed'))}{order.payoutFailureReason ? `: ${order.payoutFailureReason}` : ''}</Badge>
                  : <Badge variant="warning">{t(payoutStatusKey(order.payoutStatus))}</Badge>}
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
