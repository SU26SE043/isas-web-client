import { ArrowDown, ArrowUp, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { CreditTransactionResponse } from '../../types/employerPayment.types';
import { formatCreditDelta, formatDateTime, truncateId } from '../../utils/employerPayment';
import { transactionReasonLabelKey } from '../../utils/employerPaymentLabels';

export function TransactionsTable({ transactions }: { transactions: CreditTransactionResponse[] }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  if (!transactions.length) {
    return (
      <div className="frame-satin rounded-2xl bg-surface-raised p-8 text-center">
        <p className="font-medium text-foreground">{t('employerBilling.live.emptyTransactions')}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t('employerBilling.live.emptyTransactionsHint')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('employerBilling.transactions.time')}</TableHead>
              <TableHead>{t('employerBilling.transactions.content')}</TableHead>
              <TableHead>{t('employerBilling.transactions.reference')}</TableHead>
              <TableHead className="text-right">{t('employerBilling.transactions.delta')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((item) => <TransactionRow key={item.id} item={item} locale={locale} t={t} />)}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-3 md:hidden">
        {transactions.map((item) => (
          <article key={item.id} className="frame-satin rounded-xl bg-surface-raised p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{t(transactionReasonLabelKey(item.reason))}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(item.createdAt, locale)}</p>
              </div>
              <Delta item={item} />
            </div>
            <div className="mt-3 text-sm text-muted-foreground"><Reference item={item} t={t} /></div>
          </article>
        ))}
      </div>
    </>
  );
}

function Delta({ item }: { item: CreditTransactionResponse }) {
  return (
    <span className={item.delta > 0 ? 'inline-flex items-center gap-1 font-semibold text-success' : 'inline-flex items-center gap-1 font-semibold text-error'}>
      {item.delta > 0 ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
      {formatCreditDelta(item.delta)} credit
    </span>
  );
}

function Reference({ item, t }: { item: CreditTransactionResponse; t: (key: string) => string }) {
  if (item.orderId) {
    return <Link className="text-foreground underline-offset-4 hover:underline" to={`/employer/billing/orders/${item.orderId}`}>{t('employerBilling.transactions.orderLink').replace('{id}', truncateId(item.orderId))}</Link>;
  }
  if (item.sessionId) {
    return (
      <span className="inline-flex items-center gap-2">
        {t('employerBilling.transactions.sessionLink').replace('{id}', truncateId(item.sessionId))}
        <Button variant="ghost" size="icon-xs" onClick={() => void navigator.clipboard.writeText(item.sessionId!)} aria-label={t('employerBilling.transactions.sessionLink').replace('{id}', item.sessionId)}><Copy /></Button>
      </span>
    );
  }
  return '—';
}

function TransactionRow({ item, locale, t }: { item: CreditTransactionResponse; locale: string; t: (key: string) => string }) {
  return (
    <TableRow>
      <TableCell>{formatDateTime(item.createdAt, locale)}</TableCell>
      <TableCell className="font-medium text-foreground">{t(transactionReasonLabelKey(item.reason))}</TableCell>
      <TableCell><Reference item={item} t={t} /></TableCell>
      <TableCell className="text-right"><Delta item={item} /></TableCell>
    </TableRow>
  );
}
