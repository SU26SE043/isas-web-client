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
      <p className="rounded-xl border border-subtle bg-surface-raised px-4 py-8 text-center text-sm text-muted-foreground">
        {t('payment.usage.empty')}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-subtle bg-surface-raised">
      <table className="min-w-full text-sm">
        <thead className="border-b border-subtle bg-surface-base text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{t('payment.usage.date')}</th>
            <th className="px-4 py-3">{t('payment.usage.session')}</th>
            <th className="px-4 py-3">{t('payment.usage.reserved')}</th>
            <th className="px-4 py-3">{t('payment.usage.actual')}</th>
            <th className="px-4 py-3">{t('payment.usage.status')}</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b border-subtle last:border-b-0">
              <td className="px-4 py-3 text-muted-foreground">
                {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
                  new Date(record.settledAt),
                )}
              </td>
              <td className="px-4 py-3 text-foreground">
                {language === 'vi' ? record.sessionTitleVi : record.sessionTitle}
              </td>
              <td className="px-4 py-3 text-foreground">{record.reservedTokens.toLocaleString()}</td>
              <td className="px-4 py-3 font-semibold text-foreground">
                {record.status === 'settled' ? record.actualTokens.toLocaleString() : '-'}
              </td>
              <td className="px-4 py-3 text-foreground">
                {record.status === 'settled' ? t('payment.usage.settled') : t('payment.usage.statusReserved')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
