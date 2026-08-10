import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLanguage } from '@/shared/languages';
import { QuerySection } from '../components/live/QuerySection';
import { useEmployerInvoices } from '../hooks/useEmployerPaymentQueries';
import { usePayEmployerInvoice } from '../hooks/useEmployerPaymentMutations';
import { InvoiceStatus } from '../types/employerPayment.types';
import { canManageEmployerPayment, formatDateTime, formatVnd } from '../utils/employerPayment';

const statusKeys = {
  [InvoiceStatus.Issued]: 'employerBilling.invoices.issued',
  [InvoiceStatus.Paid]: 'employerBilling.invoices.paid',
  [InvoiceStatus.Overdue]: 'employerBilling.invoices.overdue',
  [InvoiceStatus.Void]: 'employerBilling.invoices.void',
} as const;

export function EmployerInvoicesPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const invoices = useEmployerInvoices();
  const payInvoice = usePayEmployerInvoice();
  const canManage = canManageEmployerPayment(user?.role);
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  return (
    <div className="space-y-5">
      <header>
        <p className="text-label">{t('employerBilling.invoices.eyebrow')}</p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">{t('employerBilling.invoices.title')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t('employerBilling.invoices.subtitle')}</p>
      </header>

      <QuerySection isLoading={invoices.isLoading} isError={invoices.isError} onRetry={() => void invoices.refetch()}>
        {invoices.data?.length ? (
          <div className="overflow-x-auto rounded-2xl bg-surface-raised frame-satin">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-satin text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">{t('employerBilling.invoices.period')}</th>
                  <th className="px-5 py-4">{t('employerBilling.invoices.usage')}</th>
                  <th className="px-5 py-4">{t('employerBilling.invoices.amount')}</th>
                  <th className="px-5 py-4">{t('employerBilling.invoices.status')}</th>
                  <th className="px-5 py-4 text-right">{t('employerBilling.invoices.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.data.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-satin last:border-0">
                    <td className="px-5 py-4 text-foreground">
                      {formatDateTime(invoice.periodStart, locale)} – {formatDateTime(invoice.periodEnd, locale)}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{invoice.interviewCount}</td>
                    <td className="px-5 py-4 font-medium text-foreground">{formatVnd(invoice.amount, locale)}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-satin px-2.5 py-1 text-xs text-foreground">{t(statusKeys[invoice.status])}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {canManage && invoice.status !== InvoiceStatus.Paid && invoice.status !== InvoiceStatus.Void ? (
                        <Button size="sm" disabled={payInvoice.isPending} onClick={() => payInvoice.mutate(invoice.id)}>
                          {t('employerBilling.invoices.pay')}
                        </Button>
                      ) : <span className="text-xs text-muted-foreground">{t('employerBilling.invoices.noAction')}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-2xl bg-surface-raised p-8 text-center text-sm text-muted-foreground frame-satin">
            {t('employerBilling.invoices.empty')}
          </p>
        )}
      </QuerySection>
    </div>
  );
}
