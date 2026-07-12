import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const formatDate = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
  const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(value);

  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-subtle bg-surface-raised px-4 py-10 text-center">
        <p className="text-sm font-medium text-foreground">{t('employerBilling.invoices.emptyTitle')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('employerBilling.invoices.emptyDescription')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-subtle bg-surface-raised">
      <table className="hidden min-w-full text-sm md:table">
        <thead className="border-b border-subtle bg-surface-base text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{t('employerBilling.invoices.number')}</th>
            <th className="px-4 py-3">{t('employerBilling.invoices.date')}</th>
            <th className="px-4 py-3">{t('employerBilling.invoices.credits')}</th>
            <th className="px-4 py-3">{t('employerBilling.invoices.amount')}</th>
            <th className="px-4 py-3">{t('employerBilling.invoices.status')}</th>
            <th className="px-4 py-3 text-right">{t('employerBilling.invoices.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b border-subtle last:border-b-0">
              <td className="px-4 py-3 font-medium text-foreground">{invoice.number}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(invoice.issuedAt)}</td>
              <td className="px-4 py-3 text-foreground">{invoice.credits}</td>
              <td className="px-4 py-3 text-foreground">{formatCurrency(invoice.amount)}</td>
              <td className="px-4 py-3"><InvoiceStatusBadge status={invoice.status} /></td>
              <td className="px-4 py-3 text-right">
                <Button variant="outline" size="sm" loading={generatingId === invoice.id} onClick={() => onGenerate(invoice.id)}>
                  <Download aria-hidden />
                  {t('employerBilling.invoices.download')}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="divide-y divide-subtle md:hidden">
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
              {t('employerBilling.invoices.credits')}: <span className="text-foreground">{invoice.credits}</span>
            </p>
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-foreground">{formatCurrency(invoice.amount)}</p>
              <Button variant="outline" size="sm" loading={generatingId === invoice.id} onClick={() => onGenerate(invoice.id)}>
                <Download aria-hidden />
                {t('employerBilling.invoices.download')}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
