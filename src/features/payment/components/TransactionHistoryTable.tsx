import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { TransactionType, WalletTransaction } from '../types/payment.types';

interface TransactionHistoryTableProps {
  transactions: WalletTransaction[];
}

const typeLabelKey: Record<TransactionType, string> = {
  purchase: 'payment.transactions.purchase',
  consumption: 'payment.transactions.consumption',
  subscription: 'payment.transactions.subscription',
  refund: 'payment.transactions.refund',
  reserve: 'payment.transactions.reserve',
  settlement: 'payment.transactions.settlement',
};

export function TransactionHistoryTable({ transactions }: TransactionHistoryTableProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  if (transactions.length === 0) {
    return (
      <p className="rounded-xl border border-satin bg-surface-raised px-4 py-8 text-center text-sm text-muted-foreground">
        {t('payment.transactions.empty')}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('payment.transactions.date')}</TableHead>
          <TableHead>{t('payment.transactions.type')}</TableHead>
          <TableHead>{t('payment.transactions.description')}</TableHead>
          <TableHead>{t('payment.transactions.tokens')}</TableHead>
          <TableHead>{t('payment.transactions.amount')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>
              {new Intl.DateTimeFormat(locale, {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(tx.createdAt))}
            </TableCell>
            <TableCell className="text-foreground">{t(typeLabelKey[tx.type])}</TableCell>
            <TableCell className="text-foreground">
              {language === 'vi' ? tx.descriptionVi : tx.description}
            </TableCell>
            <TableCell
              className={
                tx.tokensDelta > 0
                  ? 'font-semibold text-success'
                  : tx.tokensDelta < 0
                    ? 'font-semibold text-error'
                    : 'font-semibold text-foreground'
              }
            >
              {tx.tokensDelta > 0
                ? `+${tx.tokensDelta.toLocaleString()}`
                : tx.tokensDelta === 0
                  ? '-'
                  : tx.tokensDelta.toLocaleString()}
            </TableCell>
            <TableCell>{tx.amount > 0 ? `$${tx.amount.toFixed(2)}` : '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
