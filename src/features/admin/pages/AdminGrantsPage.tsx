import { Alert, AlertDescription } from '@/components/ui/alert';
import { isTieringUiEnabled } from '@/shared/config';
import { useLanguage } from '@/shared/languages';
import { AdminPageShell } from '../components/AdminPageShell';
import { GrantCreditForm } from '../components/grants/GrantCreditForm';
import { GrantSubscriptionForm } from '../components/grants/GrantSubscriptionForm';
import { useGrantActions } from '../hooks/useAdminGrants';

/** Cấp credit / thuê bao (F20 · S11) — hai endpoint có từ 07-19 và 08-01, FE = 0 màn; 08-07 nạp 5 credit ví test qua API. */
export function AdminGrantsPage() {
  const { t } = useLanguage();
  const { grantCredits, grantSubscription } = useGrantActions();
  const showTiering = isTieringUiEnabled();   // tắt ⇒ chỉ còn cấp credit (thuê bao/tier tạm ẩn, xem isTieringUiEnabled)
  return (
    <AdminPageShell title={t(showTiering ? 'admin.grants.title' : 'admin.grants.titleCreditOnly')} description={t(showTiering ? 'admin.grants.description' : 'admin.grants.descriptionCreditOnly')}>
      <Alert variant="warning"><AlertDescription>{t('admin.grants.warning')}</AlertDescription></Alert>
      <div className={showTiering ? 'grid gap-6 xl:grid-cols-2' : 'grid gap-6 xl:max-w-3xl'}>
        <GrantCreditForm mutation={grantCredits} />
        {showTiering ? <GrantSubscriptionForm mutation={grantSubscription} /> : null}
      </div>
    </AdminPageShell>
  );
}
