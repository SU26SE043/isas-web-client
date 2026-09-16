import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import { AdminPageShell } from '../components/AdminPageShell';
import { CloseInvoiceForm } from '../components/billing/CloseInvoiceForm';
import { PaymentModeForm } from '../components/billing/PaymentModeForm';
import { WalletCard } from '../components/billing/WalletCard';
import { adminPaymentService } from '../services/adminPayment.service';
import { OWNER_TYPE_ORG, PAYMENT_MODE_CLIENT_ERRORS, isGuidLike } from '../utils/adminBilling';

export const adminWalletKey = (orgId: string) => ['admin-wallet', OWNER_TYPE_ORG, orgId] as const;

/**
 * Ví & Postpaid của tổ chức. Một tổ chức là ngữ cảnh chung cho cả trang (bản cũ hai form, hai ô
 * GUID riêng, một `result` dùng chung đè nhau). Nhận `?orgId=` để màn Tổ chức link sang.
 */
export function AdminBillingPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [orgInput, setOrgInput] = useState(searchParams.get('orgId') ?? '');
  const [orgId, setOrgId] = useState(() => { const initial = searchParams.get('orgId') ?? ''; return isGuidLike(initial) ? initial.trim() : ''; });
  const queryClient = useQueryClient();
  const wallet = useQuery({ queryKey: adminWalletKey(orgId), queryFn: () => adminPaymentService.getCreditAccount(OWNER_TYPE_ORG, orgId), enabled: Boolean(orgId), retry: (count, error) => getApiStatusCode(error) === 401 || getApiStatusCode(error) === 403 ? false : count < 2 });

  const clientError = (error: unknown, fallbackKey: string) => {
    if (error instanceof Error && error.message in PAYMENT_MODE_CLIENT_ERRORS) return t(PAYMENT_MODE_CLIENT_ERRORS[error.message]);
    return getApiErrorMessage(error, t(fallbackKey));
  };
  const setMode = useMutation({
    mutationFn: (input: { paymentMode: number; creditLimit?: number; note: string; allowStrandedCredits: boolean }) => adminPaymentService.setPaymentMode({ ownerType: OWNER_TYPE_ORG, ownerId: orgId, ...input }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: adminWalletKey(orgId) }),
  });
  const closeInvoice = useMutation({
    mutationFn: (input: { periodStart?: string; periodEnd?: string }) => adminPaymentService.closeInvoice({ orgId, ...input }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: adminWalletKey(orgId) }),
  });
  const lookup = () => { const value = orgInput.trim(); if (isGuidLike(value)) { setOrgId(value); setMode.reset(); closeInvoice.reset(); } };
  const invalidOrg = orgInput.trim().length > 0 && !isGuidLike(orgInput);

  return (
    <AdminPageShell title={t('admin.billing.title')} description={t('admin.billing.description')}>
      <section className="frame-satin space-y-4 rounded-2xl bg-surface-raised p-6" aria-label={t('admin.billing.orgSection')}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <Label htmlFor="billing-org-id">{t('admin.billing.orgId')}</Label>
            <Input id="billing-org-id" value={orgInput} onChange={(event) => setOrgInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') lookup(); }} placeholder={t('admin.billing.orgIdPlaceholder')} aria-invalid={invalidOrg || undefined} />
          </div>
          <Button type="button" variant="outline" onClick={lookup} disabled={!isGuidLike(orgInput)}>{t('admin.billing.lookup')}</Button>
        </div>
        {invalidOrg ? <p className="text-xs text-error">{t('admin.billing.orgIdInvalid')}</p> : <p className="text-xs text-muted-foreground">{t('admin.billing.orgIdHint')}</p>}
        <WalletCard query={wallet} orgId={orgId} />
      </section>

      {orgId && wallet.data ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <PaymentModeForm orgId={orgId} wallet={wallet.data} busy={setMode.isPending} errorMessage={setMode.isError ? clientError(setMode.error, 'admin.billing.actionFailed') : null} result={setMode.data ?? null} onSubmit={(input) => setMode.mutate(input)} />
          <CloseInvoiceForm orgId={orgId} wallet={wallet.data} busy={closeInvoice.isPending} errorMessage={closeInvoice.isError ? clientError(closeInvoice.error, 'admin.billing.actionFailed') : null} result={closeInvoice.data ?? null} onSubmit={(input) => closeInvoice.mutate(input)} />
        </div>
      ) : !orgId ? (
        <Alert variant="default"><AlertDescription>{t('admin.billing.formsLocked')}</AlertDescription></Alert>
      ) : null}
    </AdminPageShell>
  );
}
