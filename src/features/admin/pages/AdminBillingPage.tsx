import { useState } from 'react';
import toast from 'react-hot-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { AdminPageShell } from '../components/AdminPageShell';
import { adminPaymentService } from '../services/adminPayment.service';

type PaymentModeChoice = 'prepaid' | 'postpaid';

export function AdminBillingPage() {
  const { t } = useLanguage();
  const [orgId, setOrgId] = useState('');
  const [mode, setMode] = useState<PaymentModeChoice>('postpaid');
  const [creditLimit, setCreditLimit] = useState('');
  const [note, setNote] = useState('');
  const [allowStrandedCredits, setAllowStrandedCredits] = useState(false);
  const [closeOrgId, setCloseOrgId] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [busy, setBusy] = useState<'mode' | 'invoice' | null>(null);
  const [result, setResult] = useState<unknown>(null);

  const setOrganizationMode = async () => {
    const parsedLimit = creditLimit.trim() ? Number(creditLimit) : undefined;
    if (!orgId.trim() || !note.trim() || (mode === 'postpaid' && (!parsedLimit || parsedLimit <= 0))) {
      toast.error(t('admin.billing.validation'));
      return;
    }
    setBusy('mode');
    try {
      const response = await adminPaymentService.setPaymentMode({
        ownerType: 0,
        ownerId: orgId,
        paymentMode: mode === 'postpaid' ? 1 : 0,
        ...(mode === 'postpaid' ? { creditLimit: parsedLimit } : {}),
        note,
        allowStrandedCredits,
      });
      setResult(response);
      toast.success(t('admin.billing.modeSuccess'));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('admin.billing.actionFailed')));
    } finally {
      setBusy(null);
    }
  };

  const closeOrganizationInvoice = async () => {
    if (!closeOrgId.trim()) {
      toast.error(t('admin.billing.orgRequired'));
      return;
    }
    setBusy('invoice');
    try {
      const response = await adminPaymentService.closeInvoice({
        orgId: closeOrgId,
        ...(periodStart ? { periodStart } : {}),
        ...(periodEnd ? { periodEnd } : {}),
      });
      setResult(response);
      toast.success(t('admin.billing.invoiceSuccess'));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('admin.billing.actionFailed')));
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminPageShell
      eyebrow="PAY-BK24"
      title={t('admin.billing.title')}
      description={t('admin.billing.description')}
    >
      <Alert variant="info">
        <AlertDescription>{t('admin.billing.rule')}</AlertDescription>
      </Alert>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="frame-satin rounded-2xl bg-surface-raised p-6">
          <h2 className="text-xl font-semibold text-foreground">{t('admin.billing.modeTitle')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('admin.billing.modeDescription')}</p>
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="billing-org-id">{t('admin.billing.orgId')}</Label>
              <Input id="billing-org-id" value={orgId} onChange={(event) => setOrgId(event.target.value)} placeholder={t('admin.billing.orgIdPlaceholder')} />
            </div>
            <div>
              <Label htmlFor="billing-mode">{t('admin.billing.mode')}</Label>
              <select id="billing-mode" value={mode} onChange={(event) => setMode(event.target.value as PaymentModeChoice)} className="mt-2 flex h-10 w-full rounded-md border border-satin bg-surface-overlay px-3 text-sm text-foreground">
                <option value="postpaid">{t('admin.billing.postpaid')}</option>
                <option value="prepaid">{t('admin.billing.prepaid')}</option>
              </select>
            </div>
            {mode === 'postpaid' ? (
              <div>
                <Label htmlFor="billing-credit-limit">{t('admin.billing.creditLimit')}</Label>
                <Input id="billing-credit-limit" type="number" min="1" value={creditLimit} onChange={(event) => setCreditLimit(event.target.value)} placeholder="100" />
              </div>
            ) : null}
            <div>
              <Label htmlFor="billing-note">{t('admin.billing.note')}</Label>
              <textarea id="billing-note" value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="mt-2 w-full rounded-md border border-satin bg-surface-overlay px-3 py-2 text-sm text-foreground" />
            </div>
            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input type="checkbox" checked={allowStrandedCredits} onChange={(event) => setAllowStrandedCredits(event.target.checked)} className="mt-1" />
              <span>{t('admin.billing.allowStrandedCredits')}</span>
            </label>
            <Button type="button" disabled={busy !== null} onClick={() => void setOrganizationMode()}>
              {busy === 'mode' ? t('admin.billing.saving') : t('admin.billing.saveMode')}
            </Button>
          </div>
        </section>

        <section className="frame-satin rounded-2xl bg-surface-raised p-6">
          <h2 className="text-xl font-semibold text-foreground">{t('admin.billing.invoiceTitle')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('admin.billing.invoiceDescription')}</p>
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="close-invoice-org-id">{t('admin.billing.orgId')}</Label>
              <Input id="close-invoice-org-id" value={closeOrgId} onChange={(event) => setCloseOrgId(event.target.value)} placeholder={t('admin.billing.orgIdPlaceholder')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="period-start">{t('admin.billing.periodStart')}</Label><Input id="period-start" type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} /></div>
              <div><Label htmlFor="period-end">{t('admin.billing.periodEnd')}</Label><Input id="period-end" type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} /></div>
            </div>
            <Button type="button" disabled={busy !== null} onClick={() => void closeOrganizationInvoice()}>
              {busy === 'invoice' ? t('admin.billing.closing') : t('admin.billing.closeInvoice')}
            </Button>
          </div>
        </section>
      </div>

      {result ? (
        <pre className="overflow-x-auto rounded-xl border border-satin bg-surface-raised p-4 text-xs text-muted-foreground" aria-live="polite">
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </AdminPageShell>
  );
}
