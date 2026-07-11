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
};

export function TransactionHistoryTable({ transactions }: TransactionHistoryTableProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  if (transactions.length === 0) {
    return (
      <p className="rounded-xl border border-subtle bg-surface-raised px-4 py-8 text-center text-sm text-muted-foreground">
        {t('payment.transactions.empty')}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-subtle bg-surface-raised">
      <table className="min-w-full text-sm">
        <thead className="border-b border-subtle bg-surface-base text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{t('payment.transactions.date')}</th>
            <th className="px-4 py-3">{t('payment.transactions.type')}</th>
            <th className="px-4 py-3">{t('payment.transactions.description')}</th>
            <th className="px-4 py-3">{t('payment.transactions.credits')}</th>
            <th className="px-4 py-3">{t('payment.transactions.amount')}</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-subtle last:border-b-0">
              <td className="px-4 py-3 text-muted-foreground">
                {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
                  new Date(tx.createdAt),
                )}
              </td>
              <td className="px-4 py-3 text-foreground">{t(typeLabelKey[tx.type])}</td>
              <td className="px-4 py-3 text-foreground">
                {language === 'vi' ? tx.descriptionVi : tx.description}
              </td>
              <td
                className={[
                  'px-4 py-3 font-semibold',
                  tx.creditsDelta > 0 ? 'text-success' : tx.creditsDelta < 0 ? 'text-error' : 'text-foreground',
                ].join(' ')}
              >
                {tx.creditsDelta > 0 ? `+${tx.creditsDelta}` : tx.creditsDelta}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {tx.amount > 0 ? `$${tx.amount.toFixed(2)}` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
