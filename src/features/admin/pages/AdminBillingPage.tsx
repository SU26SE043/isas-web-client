import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/shared/languages';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { AdminPageShell } from '../components/AdminPageShell';
import { CloseInvoiceForm } from '../components/billing/CloseInvoiceForm';
import { CreditLedger } from '../components/billing/CreditLedger';
import { PaymentModeForm } from '../components/billing/PaymentModeForm';
import { PostpaidWorklist } from '../components/billing/PostpaidWorklist';
import { WalletCard } from '../components/billing/WalletCard';
import { OrgPicker } from '../components/common/OrgPicker';
import { useAdminWallet, useBillingActions, usePostpaidOverview } from '../hooks/useAdminBilling';
import { useAdminOrgNameMap } from '../hooks/useAdminOrgOptions';
import { OWNER_TYPE_ORG, PAYMENT_MODE_CLIENT_ERRORS, isGuidLike } from '../utils/adminBilling';

export { adminWalletKey } from '../hooks/useAdminBilling';

/**
 * Ví & Postpaid — một tổ chức là ngữ cảnh chung cho cả trang. Đợt D: worklist postpaid đứng đầu (khẩn nhất
 * trên cùng, bấm là chọn), chọn tổ chức theo TÊN (`OrgPicker`) thay ô GUID, và thêm sổ cái credit.
 * Vẫn nhận `?orgId=` để màn Tổ chức link sang.
 */
export function AdminBillingPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [orgId, setOrgId] = useState(() => { const initial = searchParams.get('orgId') ?? ''; return isGuidLike(initial) ? initial.trim() : ''; });
  const wallet = useAdminWallet(orgId);
  const overview = usePostpaidOverview();
  const { names } = useAdminOrgNameMap();
  const { setMode, closeInvoice } = useBillingActions(orgId);

  const clientError = (error: unknown, fallbackKey: string) => {
    if (error instanceof Error && error.message in PAYMENT_MODE_CLIENT_ERRORS) return t(PAYMENT_MODE_CLIENT_ERRORS[error.message]);
    return getApiErrorMessage(error, t(fallbackKey));
  };
  const selectOrg = (next: string) => { setOrgId(next); setMode.reset(); closeInvoice.reset(); };

  return (
    <AdminPageShell title={t('admin.billing.title')} description={t('admin.billing.description')}>
      <PostpaidWorklist rows={overview.data} isLoading={overview.isLoading} isError={overview.isError} names={names} selectedOrgId={orgId} onSelect={selectOrg} />

      <section className="frame-satin space-y-4 rounded-2xl bg-surface-raised p-6" aria-label={t('admin.billing.orgSection')}>
        <OrgPicker value={orgId} onChange={selectOrg} />
        <WalletCard query={wallet} orgId={orgId} />
      </section>

      {orgId && wallet.data ? (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <PaymentModeForm orgId={orgId} wallet={wallet.data} busy={setMode.isPending} errorMessage={setMode.isError ? clientError(setMode.error, 'admin.billing.actionFailed') : null} result={setMode.data ?? null} onSubmit={(input) => setMode.mutate(input)} />
            <CloseInvoiceForm orgId={orgId} wallet={wallet.data} busy={closeInvoice.isPending} errorMessage={closeInvoice.isError ? clientError(closeInvoice.error, 'admin.billing.actionFailed') : null} result={closeInvoice.data ?? null} onSubmit={(input) => closeInvoice.mutate(input)} />
          </div>
          <CreditLedger ownerType={OWNER_TYPE_ORG} ownerId={orgId} />
        </>
      ) : !orgId ? (
        <Alert variant="default"><AlertDescription>{t('admin.billing.formsLocked')}</AlertDescription></Alert>
      ) : null}
    </AdminPageShell>
  );
}
