import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { ORDER_STATUS_REFUNDED, orderStatusKey, ownerTypeKey, refundSettlementKey } from '../../utils/adminBilling';
import { SELECT_CLASS } from '../common/OrgPicker';

export interface OrderFilters { status?: number; ownerType?: number; refundSettlement?: number }
const STATUSES = [1, 2, 3, 4, 5, 6];

/** Đọc `<select>` "Tất cả" (chuỗi rỗng) về `undefined` để không gửi `?status=` rỗng lên BE. */
const parse = (value: string) => (value === '' ? undefined : Number(value));

export function AdminOrdersToolbar({ filters, isFetching, onChange, onRefresh }: { filters: OrderFilters; isFetching: boolean; onChange: (next: OrderFilters) => void; onRefresh: () => void }) {
  const { t } = useLanguage();
  const refundOnly = filters.status === ORDER_STATUS_REFUNDED;
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5"><Label htmlFor="orders-status">{t('admin.orders.filter.status')}</Label>
        <select id="orders-status" className={SELECT_CLASS} value={filters.status ?? ''} onChange={(event) => { const status = parse(event.target.value); onChange({ ...filters, status, ...(status !== ORDER_STATUS_REFUNDED ? { refundSettlement: undefined } : {}) }); }}>
          <option value="">{t('admin.orders.filter.all')}</option>
          {STATUSES.map((status) => <option key={status} value={status}>{t(orderStatusKey(status))}</option>)}
        </select></div>
      <div className="space-y-1.5"><Label htmlFor="orders-owner">{t('admin.orders.filter.owner')}</Label>
        <select id="orders-owner" className={SELECT_CLASS} value={filters.ownerType ?? ''} onChange={(event) => onChange({ ...filters, ownerType: parse(event.target.value) })}>
          <option value="">{t('admin.orders.filter.all')}</option>
          <option value={0}>{t(ownerTypeKey(0))}</option><option value={1}>{t(ownerTypeKey(1))}</option>
        </select></div>
      {refundOnly ? (
        <div className="space-y-1.5"><Label htmlFor="orders-settlement">{t('admin.orders.filter.settlement')}</Label>
          <select id="orders-settlement" className={SELECT_CLASS} value={filters.refundSettlement ?? ''} onChange={(event) => onChange({ ...filters, refundSettlement: parse(event.target.value) })}>
            <option value="">{t('admin.orders.filter.all')}</option>
            <option value={1}>{t(refundSettlementKey(1))}</option><option value={2}>{t(refundSettlementKey(2))}</option>
          </select></div>
      ) : null}
      <Button type="button" variant="outline" loading={isFetching} onClick={onRefresh}><RefreshCw aria-hidden />{t('admin.orders.refresh')}</Button>
    </div>
  );
}
