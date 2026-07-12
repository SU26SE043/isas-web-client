import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import { BillingMetricCard } from '../components/BillingMetricCard';
import { InvoiceTable } from '../components/InvoiceTable';
import { useEmployerBilling } from '../hooks/useEmployerBilling';

export function EmployerInvoicesPage() {
  const { t, language } = useLanguage();
  const { invoices, isLoading, generateInvoicePdf } = useEmployerBilling();
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [messageKey, setMessageKey] = useState<string | null>(null);
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const paidTotal = invoices.filter((invoice) => invoice.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0);

  const handleGenerate = async (invoiceId: string) => {
    setGeneratingId(invoiceId);
    setMessageKey(null);
    try {
      const result = await generateInvoicePdf(invoiceId);
      setMessageKey(result.messageKey);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-base px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{t('employerBilling.invoices.eyebrow')}</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">{t('employerBilling.invoices.title')}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t('employerBilling.invoices.subtitle')}</p>
        </header>

        {messageKey ? (
          <Alert variant="success">
            <AlertDescription>{t(messageKey)}</AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <BillingMetricCard label={t('employerBilling.invoices.totalInvoices')} value={invoices.length} hint={t('employerBilling.invoices.totalInvoicesHint')} icon={<FileText className="h-5 w-5" aria-hidden />} />
          <BillingMetricCard label={t('employerBilling.invoices.paidTotal')} value={new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(paidTotal)} hint={t('employerBilling.invoices.paidTotalHint')} icon={<FileText className="h-5 w-5" aria-hidden />} />
          <BillingMetricCard label={t('employerBilling.invoices.sla')} value={t('employerBilling.invoices.slaValue')} hint={t('employerBilling.invoices.slaHint')} icon={<FileText className="h-5 w-5" aria-hidden />} />
        </section>

        <Card className="border border-subtle bg-surface-raised">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="h-80 animate-pulse bg-surface-overlay" />
            ) : (
              <InvoiceTable invoices={invoices} generatingId={generatingId} onGenerate={handleGenerate} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
