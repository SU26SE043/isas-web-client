import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { EmployerInvoice } from '../types/employerBilling.types';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';

interface InvoiceTableProps {
  invoices: EmployerInvoice[];
  generatingId: string | null;
  onGenerate: (invoiceId: string) => void;
}

export function InvoiceTable({ invoices, generatingId, onGenerate }: InvoiceTableProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(value);

  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-satin bg-surface-raised px-4 py-10 text-center">
        <p className="text-sm font-medium text-foreground">
          {t('employerBilling.invoices.emptyTitle')}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('employerBilling.invoices.emptyDescription')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('employerBilling.invoices.number')}</TableHead>
              <TableHead>{t('employerBilling.invoices.date')}</TableHead>
              <TableHead>{t('employerBilling.invoices.tokenUsage')}</TableHead>
              <TableHead>{t('employerBilling.invoices.amount')}</TableHead>
              <TableHead>{t('employerBilling.invoices.status')}</TableHead>
              <TableHead className="text-right">
                {t('employerBilling.invoices.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium text-foreground">{invoice.number}</TableCell>
                <TableCell>{formatDate(invoice.issuedAt)}</TableCell>
                <TableCell className="text-foreground">{invoice.tokenUsage}</TableCell>
                <TableCell className="text-foreground">{formatCurrency(invoice.amount)}</TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    loading={generatingId === invoice.id}
                    onClick={() => onGenerate(invoice.id)}
                  >
                    <Download aria-hidden />
                    {t('employerBilling.invoices.download')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="frame-satin divide-y divide-satin overflow-hidden rounded-xl bg-surface-raised md:hidden">
        {invoices.map((invoice) => (
          <article key={invoice.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{invoice.number}</p>
                <p className="text-sm text-muted-foreground">{formatDate(invoice.issuedAt)}</p>
              </div>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('employerBilling.invoices.tokenUsage')}:{' '}
              <span className="text-foreground">{invoice.tokenUsage}</span>
            </p>
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-foreground">{formatCurrency(invoice.amount)}</p>
              <Button
                variant="outline"
                size="sm"
                loading={generatingId === invoice.id}
                onClick={() => onGenerate(invoice.id)}
              >
                <Download aria-hidden />
                {t('employerBilling.invoices.download')}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
