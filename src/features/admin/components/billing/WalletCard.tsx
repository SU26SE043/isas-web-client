import type { UseQueryResult } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { StatCard, StatGrid } from '@/components/patterns/StatCard';
import { useLanguage } from '@/shared/languages';
import { getApiErrorMessage } from '@/shared/api/apiError';
import type { CreditAccount } from '../../types/adminApi.types';
import { PAYMENT_MODE_POSTPAID, accountStatusKey, paymentModeKey } from '../../utils/adminBilling';

/**
 * Trạng thái ví của tổ chức đang chọn — hiện TRƯỚC khi cho đổi gì. Bản cũ không GET gì nên admin
 * duyệt Postpaid mà không biết ví đang ở chế độ nào, còn bao nhiêu credit đang giữ.
 */
export function WalletCard({ query, orgId }: { query: UseQueryResult<CreditAccount, unknown>; orgId: string }) {
  const { t } = useLanguage();
  if (!orgId) return <Alert variant="info"><AlertDescription>{t('admin.billing.wallet.pickOrg')}</AlertDescription></Alert>;
  if (query.isLoading) return <p aria-live="polite" className="text-sm text-muted-foreground">{t('admin.billing.wallet.loading')}</p>;
  if (query.isError) return <Alert variant="error"><AlertDescription>{getApiErrorMessage(query.error, t('admin.billing.wallet.error'))}</AlertDescription></Alert>;
  const wallet = query.data;
  if (!wallet) return null;
  if (!wallet.walletExists) return <Alert variant="warning"><AlertDescription>{t('admin.billing.wallet.missing')}</AlertDescription></Alert>;
  return (
    <section aria-label={t('admin.billing.wallet.title')} className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium text-foreground">{t('admin.billing.wallet.title')}</h3>
        <Badge variant={wallet.paymentMode === PAYMENT_MODE_POSTPAID ? 'info' : 'outline'}>{t(paymentModeKey(wallet.paymentMode))}</Badge>
        <Badge variant={wallet.status === 1 ? 'warning' : 'success'}>{t(accountStatusKey(wallet.status))}</Badge>
      </div>
      <StatGrid columns={2}>
        <StatCard label={t('admin.billing.wallet.remaining')} value={wallet.remainingCredits} hint={t('admin.billing.wallet.remainingHint')} />
        <StatCard label={t('admin.billing.wallet.reserved')} value={wallet.reservedCredits} hint={t('admin.billing.wallet.reservedHint')} />
      </StatGrid>
    </section>
  );
}
