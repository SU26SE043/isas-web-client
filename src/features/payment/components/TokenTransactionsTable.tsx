import { ArrowDown, ArrowUp, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { CreditTransactionResponse } from '../types/payment.types';

export function TokenTransactionsTable({ transactions }: { transactions: CreditTransactionResponse[] }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  if (!transactions.length) return <div className="frame-satin rounded-2xl bg-surface-raised p-8 text-center"><p className="font-medium text-foreground">{t('payment.transactions.empty')}</p></div>;
  return <div className="overflow-x-auto frame-satin rounded-2xl bg-surface-raised">
    <Table className="min-w-[760px]"><TableHeader><TableRow>
      <TableHead>{t('payment.transactions.date')}</TableHead><TableHead>{t('payment.transactions.type')}</TableHead>
      <TableHead className="text-right">{t('payment.transactions.change')}</TableHead><TableHead>{t('payment.transactions.related')}</TableHead>
    </TableRow></TableHeader><TableBody>{transactions.map((item) => <TableRow key={item.id}>
      <TableCell>{formatDate(item.createdAt, locale)}</TableCell>
      <TableCell><span className={getReasonClass(item.reason)}>{getReasonLabel(item.reason, t)}</span></TableCell>
      <TableCell className="text-right"><Delta value={item.delta} /></TableCell>
      <TableCell><div className="flex items-center gap-2">{item.sessionId ? <><span className="text-xs text-muted-foreground">{t('payment.transactions.sessionShort')}</span><CopyId value={item.sessionId} /></> : item.orderId ? <><span className="text-xs text-muted-foreground">{t('payment.transactions.orderShort')}</span><CopyId value={item.orderId} /></> : <span className="text-muted-foreground">—</span>}</div></TableCell>
    </TableRow>)}</TableBody></Table>
  </div>;
}

function getReasonLabel(reason: number, t: (key: string) => string) {
  if (reason === 1 || reason === 2 || reason === 3) return t('payment.transactions.consumption');
  if (reason === 0 || reason === 5) return t('payment.transactions.purchase');
  if (reason === 4) return t('payment.transactions.refund');
  return t('payment.transactions.reasonUnknown').replace('{reason}', String(reason));
}

function getReasonClass(reason: number) {
  if (reason === 1 || reason === 2 || reason === 3) return 'rounded-full border border-error/30 bg-error-bg px-2.5 py-1 text-xs font-medium text-error';
  if (reason === 0 || reason === 5) return 'rounded-full border border-success/30 bg-success-bg px-2.5 py-1 text-xs font-medium text-success';
  return 'rounded-full border border-subtle bg-surface-overlay px-2.5 py-1 text-xs font-medium text-muted-foreground';
}

function CopyId({ value }: { value: string }) {
  const { t } = useLanguage();
  return <button type="button" title={value} className="inline-flex max-w-40 items-center gap-1 truncate text-xs text-foreground hover:text-info" onClick={() => { void navigator.clipboard.writeText(value); toast.success(t('payment.transactions.copied')); }}><Copy className="size-3 shrink-0" aria-hidden />{shortId(value)}</button>;
}

function Delta({ value }: { value: number }) {
  const positive = value > 0;
  return <span className={positive ? 'inline-flex items-center gap-1 font-semibold text-info' : 'inline-flex items-center gap-1 font-semibold text-error'}>{positive ? <ArrowUp className="size-4" aria-hidden /> : <ArrowDown className="size-4" aria-hidden />}{value > 0 ? '+' : ''}{value.toLocaleString()}</span>;
}

function shortId(value: string) { return value.length > 16 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value; }
function formatDate(value: string, locale: string) { return new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)); }
