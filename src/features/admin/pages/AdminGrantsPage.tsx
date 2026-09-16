import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/shared/languages';
import { AdminPageShell } from '../components/AdminPageShell';
import { GrantCreditForm } from '../components/grants/GrantCreditForm';
import { GrantSubscriptionForm } from '../components/grants/GrantSubscriptionForm';
import { useGrantActions } from '../hooks/useAdminGrants';

/** Cấp credit / thuê bao (F20 · S11) — hai endpoint có từ 07-19 và 08-01, FE = 0 màn; 08-07 nạp 5 credit ví test qua API. */
export function AdminGrantsPage() {
  const { t } = useLanguage();
  const { grantCredits, grantSubscription } = useGrantActions();
  return (
    <AdminPageShell title={t('admin.grants.title')} description={t('admin.grants.description')}>
      <Alert variant="warning"><AlertDescription>{t('admin.grants.warning')}</AlertDescription></Alert>
      <div className="grid gap-6 xl:grid-cols-2">
        <GrantCreditForm mutation={grantCredits} />
        <GrantSubscriptionForm mutation={grantSubscription} />
      </div>
    </AdminPageShell>
  );
}
