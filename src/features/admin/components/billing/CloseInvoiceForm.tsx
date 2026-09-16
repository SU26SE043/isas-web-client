import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { CreditAccount, InvoiceResult } from '../../types/adminApi.types';
import { PAYMENT_MODE_POSTPAID, formatVnd, invoiceStatusKey } from '../../utils/adminBilling';

interface CloseInvoiceFormProps {
  orgId: string;
  wallet: CreditAccount | undefined;
  busy: boolean;
  errorMessage: string | null;
  result: InvoiceResult | null;
  onSubmit: (input: { periodStart?: string; periodEnd?: string }) => void;
}

/**
 * Chốt kỳ postpaid → phát hành hoá đơn. Chỉ có nghĩa với ví Postpaid — ví Prepaid thì nút bị khoá
 * kèm lý do, thay vì để bấm rồi nhận lỗi. Có confirm (bấm nhầm lần hai là phát hành thêm một hoá
 * đơn 0đ). Kết quả hiện kỳ · số buổi · đơn giá · thành tiền · trạng thái, không phải JSON.
 */
export function CloseInvoiceForm({ orgId, wallet, busy, errorMessage, result, onSubmit }: CloseInvoiceFormProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  useEffect(() => { setPeriodStart(''); setPeriodEnd(''); }, [orgId]);
  useEffect(() => { if (result) { setPeriodStart(''); setPeriodEnd(''); setConfirmOpen(false); } }, [result]);

  const rangeInvalid = Boolean(periodStart && periodEnd && periodStart > periodEnd);
  const notPostpaid = Boolean(wallet?.walletExists) && wallet?.paymentMode !== PAYMENT_MODE_POSTPAID;
  const canSubmit = Boolean(orgId) && !rangeInvalid && !notPostpaid && !busy;
  const fmtDate = (iso: string) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(locale, { dateStyle: 'medium' }); };

  return (
    <section className="frame-satin rounded-2xl bg-surface-raised p-6">
      <h2 className="text-xl font-semibold text-foreground">{t('admin.billing.invoiceTitle')}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t('admin.billing.invoiceDescription')}</p>
      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="period-start">{t('admin.billing.periodStart')}</Label><Input id="period-start" type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} /></div>
          <div><Label htmlFor="period-end">{t('admin.billing.periodEnd')}</Label><Input id="period-end" type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} /></div>
        </div>
        <p className="text-xs text-muted-foreground">{t('admin.billing.periodHint')}</p>
        {rangeInvalid ? <p className="text-xs text-error">{t('admin.billing.periodInvalid')}</p> : null}
        {notPostpaid ? <Alert variant="info"><AlertDescription>{t('admin.billing.invoiceNotPostpaid')}</AlertDescription></Alert> : null}
        {errorMessage ? <Alert variant="error"><AlertDescription>{errorMessage}</AlertDescription></Alert> : null}
        <Button type="button" disabled={!canSubmit} loading={busy} onClick={() => setConfirmOpen(true)}>{t('admin.billing.closeInvoice')}</Button>
        {result ? (
          <Alert variant="success">
            <AlertDescription>
              {t('admin.billing.invoiceResult')
                .replace('{from}', fmtDate(result.periodStart))
                .replace('{to}', fmtDate(result.periodEnd))
                .replace('{count}', String(result.interviewCount))
                .replace('{unit}', formatVnd(result.unitPrice, locale))
                .replace('{amount}', formatVnd(result.amount, locale))
                .replace('{status}', t(invoiceStatusKey(result.status)))}
              {result.interviewCount === 0 ? ` ${t('admin.billing.invoiceZeroWarning')}` : ''}
            </AlertDescription>
          </Alert>
        ) : null}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('admin.billing.invoiceConfirmTitle')}
        description={t('admin.billing.invoiceConfirmDescription')}
        confirmLabel={t('admin.billing.closeInvoice')}
        cancelLabel={t('admin.billing.cancel')}
        loading={busy}
        onConfirm={() => onSubmit({ ...(periodStart ? { periodStart } : {}), ...(periodEnd ? { periodEnd } : {}) })}
      />
    </section>
  );
}
