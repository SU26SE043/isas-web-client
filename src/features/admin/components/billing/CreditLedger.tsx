import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import { useCreditLedger } from '../../hooks/useAdminBilling';
import { creditReasonKey, shortId } from '../../utils/adminBilling';

/**
 * Sổ cái credit của ví — trả lời "credit của tổ chức này đi đâu" mà không phải mở DB. Đây là bảng
 * append-only phía BE (bất biến `remaining + reserved = Σ delta`), nên đọc thẳng là đủ tin.
 */
export function CreditLedger({ ownerType, ownerId }: { ownerType: number; ownerId: string }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const ledger = useCreditLedger(ownerType, ownerId);
  const rows = ledger.data?.pages.flatMap((page) => page.items) ?? [];
  const when = (iso: string) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

  return (
    <section className="frame-satin space-y-3 rounded-2xl bg-surface-raised p-6" aria-labelledby="credit-ledger-title">
      <div><h2 id="credit-ledger-title" className="text-base font-medium text-foreground">{t('admin.billing.ledger.title')}</h2><p className="text-sm text-muted-foreground">{t('admin.billing.ledger.description')}</p></div>
      {ledger.isLoading ? <Skeleton className="h-24" /> : null}
      {ledger.isError ? <Alert variant="error"><AlertDescription>{t('admin.billing.ledger.error')}</AlertDescription></Alert> : null}
      {ledger.data && rows.length === 0 ? <p className="text-sm text-muted-foreground">{t('admin.billing.ledger.empty')}</p> : null}
      {rows.length > 0 ? (
        <Table aria-label={t('admin.billing.ledger.title')}>
          <TableHeader><TableRow><TableHead>{t('admin.billing.ledger.when')}</TableHead><TableHead>{t('admin.billing.ledger.reason')}</TableHead><TableHead className="text-right">{t('admin.billing.ledger.delta')}</TableHead><TableHead>{t('admin.billing.ledger.ref')}</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="whitespace-nowrap">{when(row.createdAt)}</TableCell>
                <TableCell>{t(creditReasonKey(row.reason))}</TableCell>
                <TableCell className={`text-right font-medium tabular-nums ${row.delta < 0 ? 'text-foreground' : 'text-success'}`}>{row.delta > 0 ? `+${row.delta}` : row.delta}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {row.orderId ? `${t('admin.billing.ledger.order')} ${shortId(row.orderId)}` : row.sessionId ? `${t('admin.billing.ledger.session')} ${shortId(row.sessionId)}` : row.reversesTransactionId ? `${t('admin.billing.ledger.reverses')} ${shortId(row.reversesTransactionId)}` : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
      {ledger.hasNextPage ? <Button type="button" variant="outline" size="sm" loading={ledger.isFetchingNextPage} onClick={() => void ledger.fetchNextPage()}>{t('admin.billing.ledger.more')}</Button> : null}
    </section>
  );
}
