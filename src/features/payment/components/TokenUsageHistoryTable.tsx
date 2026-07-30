import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { TokenUsageRecord } from '../types/payment.types';

interface TokenUsageHistoryTableProps {
  records: TokenUsageRecord[];
}

export function TokenUsageHistoryTable({ records }: TokenUsageHistoryTableProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  if (records.length === 0) {
    return (
      <p className="rounded-xl border border-satin bg-surface-raised px-4 py-8 text-center text-sm text-muted-foreground">
        {t('payment.usage.empty')}
      </p>
    );
  }

  return (
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
            <TableCell>
              {new Intl.DateTimeFormat(locale, {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(record.settledAt))}
            </TableCell>
            <TableCell className="text-foreground">
              {language === 'vi' ? record.sessionTitleVi : record.sessionTitle}
            </TableCell>
            <TableCell className="text-foreground">
              {record.reservedTokens.toLocaleString()}
            </TableCell>
            <TableCell className="font-semibold text-foreground">
              {record.status === 'settled' ? record.actualTokens.toLocaleString() : '-'}
            </TableCell>
            <TableCell className="text-foreground">
              {record.status === 'settled'
                ? t('payment.usage.settled')
                : t('payment.usage.statusReserved')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
