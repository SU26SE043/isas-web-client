import { CheckCircle2, Clock3 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { TokenUsageRecord } from '../types/payment.types';

export function TokenUsageHistoryTable({ records }: { records: TokenUsageRecord[] }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  if (!records.length) {
    return (
      <div className="frame-satin rounded-2xl bg-surface-raised p-8 text-center">
        <p className="font-medium text-foreground">{t('payment.usage.empty')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('payment.usage.date')}</TableHead>
              <TableHead>{t('payment.usage.session')}</TableHead>
              <TableHead>{t('payment.usage.reserved')}</TableHead>
              <TableHead>{t('payment.usage.actual')}</TableHead>
              <TableHead>{t('payment.usage.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{formatDate(record.settledAt, locale)}</TableCell>
                <TableCell className="font-medium text-foreground">
                  {language === 'vi' ? record.sessionTitleVi : record.sessionTitle}
                </TableCell>
                <TableCell>{record.reservedTokens.toLocaleString(locale)}</TableCell>
                <TableCell>{record.status === 'settled' ? record.actualTokens.toLocaleString(locale) : '—'}</TableCell>
                <TableCell><UsageStatus status={record.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-3 md:hidden">
        {records.map((record) => (
          <article key={record.id} className="frame-satin rounded-xl bg-surface-raised p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">
                  {language === 'vi' ? record.sessionTitleVi : record.sessionTitle}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(record.settledAt, locale)}</p>
              </div>
              <UsageStatus status={record.status} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-satin pt-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">{t('payment.usage.reserved')}</dt>
                <dd className="mt-1 font-medium text-foreground">{record.reservedTokens.toLocaleString(locale)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('payment.usage.actual')}</dt>
                <dd className="mt-1 font-medium text-foreground">{record.status === 'settled' ? record.actualTokens.toLocaleString(locale) : '—'}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}

function UsageStatus({ status }: { status: TokenUsageRecord['status'] }) {
  const { t } = useLanguage();
  const settled = status === 'settled';
  return (
    <span className={settled ? 'inline-flex items-center gap-1.5 text-xs font-medium text-success' : 'inline-flex items-center gap-1.5 text-xs font-medium text-warning'}>
      {settled ? <CheckCircle2 className="size-3.5" aria-hidden /> : <Clock3 className="size-3.5" aria-hidden />}
      {t(settled ? 'payment.usage.settled' : 'payment.usage.statusReserved')}
    </span>
  );
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
