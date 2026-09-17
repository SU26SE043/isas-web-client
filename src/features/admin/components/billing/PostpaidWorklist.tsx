import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { PostpaidOverviewRow } from '../../types/adminApi.types';
import { POSTPAID_ALERT_OVERDUE, formatVnd, postpaidAlertKey, shortId } from '../../utils/adminBilling';

interface PostpaidWorklistProps {
  rows: PostpaidOverviewRow[] | undefined;
  isLoading: boolean;
  isError: boolean;
  /** id → tên tổ chức (từ directory); thiếu ⇒ id rút gọn. */
  names: Map<string, string>;
  selectedOrgId: string;
  onSelect: (orgId: string) => void;
}

const alertVariant = (level: number | undefined) => (level ?? 0) >= POSTPAID_ALERT_OVERDUE ? 'destructive' : (level ?? 0) >= 3 ? 'warning' : (level ?? 0) >= 1 ? 'info' : 'outline';

/**
 * Việc cần xử lý về postpaid — mọi tổ chức đang trả sau, khẩn nhất trên đầu. Bấm một dòng ⇒ chọn tổ chức
 * đó cho cả trang (ví · duyệt · chốt kỳ · sổ cái). Trước đợt D admin phải biết trước org nào có vấn đề
 * rồi gõ GUID vào ô — tức không có worklist thì không ai biết đang có ai quá hạn.
 */
export function PostpaidWorklist({ rows, isLoading, isError, names, selectedOrgId, onSelect }: PostpaidWorklistProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const date = (iso: string | null) => (iso ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(iso)) : '—');

  return (
    <section className="frame-satin space-y-3 rounded-2xl bg-surface-raised p-6" aria-labelledby="postpaid-worklist-title">
      <div><h2 id="postpaid-worklist-title" className="text-base font-medium text-foreground">{t('admin.billing.worklist.title')}</h2><p className="text-sm text-muted-foreground">{t('admin.billing.worklist.description')}</p></div>
      {isLoading ? <Skeleton className="h-24" /> : null}
      {isError ? <Alert variant="error"><AlertDescription>{t('admin.billing.worklist.error')}</AlertDescription></Alert> : null}
      {rows && rows.length === 0 ? <Alert variant="info"><AlertDescription>{t('admin.billing.worklist.empty')}</AlertDescription></Alert> : null}
      {rows && rows.length > 0 ? (
        <Table aria-label={t('admin.billing.worklist.title')}>
          <TableHeader><TableRow>
            <TableHead>{t('admin.billing.worklist.org')}</TableHead><TableHead>{t('admin.billing.worklist.alert')}</TableHead>
            <TableHead className="text-right">{t('admin.billing.worklist.usage')}</TableHead><TableHead className="text-right">{t('admin.billing.worklist.pending')}</TableHead>
            <TableHead className="text-right">{t('admin.billing.worklist.unpaid')}</TableHead><TableHead>{t('admin.billing.worklist.lastPeriod')}</TableHead><TableHead />
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.ownerId} data-selected={row.ownerId === selectedOrgId || undefined} className={row.ownerId === selectedOrgId ? 'bg-surface-overlay/60' : undefined}>
                <TableCell className="font-medium text-foreground">{names.get(row.ownerId) ?? shortId(row.ownerId)}</TableCell>
                <TableCell><Badge variant={alertVariant(row.alertLevel)}>{t(postpaidAlertKey(row.alertLevel))}</Badge></TableCell>
                <TableCell className="text-right tabular-nums">{row.periodUsage + row.reservedCredits} / {row.creditLimit ?? '∞'}</TableCell>
                <TableCell className="text-right tabular-nums">{formatVnd(row.pendingAmountVnd, locale)}</TableCell>
                <TableCell className="text-right tabular-nums">{row.unpaidInvoiceCount}</TableCell>
                <TableCell>{date(row.lastInvoicePeriodEnd)}</TableCell>
                <TableCell className="text-right"><button type="button" className="text-sm text-info underline-offset-4 hover:underline" onClick={() => onSelect(row.ownerId)}>{t('admin.billing.worklist.select')}</button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </section>
  );
}
