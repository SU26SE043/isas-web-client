import { Link, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useLanguage } from '@/shared/languages';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getPostLoginPath } from '@/features/auth/utils/getPostLoginPath';
import { UserRole } from '@/features/auth/types/auth.types';
import { usePaymentOrder } from '../hooks/usePaymentOrder';
import { PaymentOrderDetailCard } from '../components/payment-result/PaymentOrderDetailCard';
import { PaymentOrderQueryStates } from '../components/payment-result/PaymentOrderQueryStates';
import { PaymentResultShell } from '../components/payment-result/PaymentResultShell';
import { isValidOrderId, resolveOrderIdFromSearch } from '../utils/resolveOrderId';

export function PaymentFailedPage() {
  const [searchParams] = useSearchParams();
  const orderId = resolveOrderIdFromSearch(searchParams);
  const isInvalidOrderId = !isValidOrderId(orderId);
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: order, isLoading, isError, error, refetch } = usePaymentOrder(
    isInvalidOrderId ? null : orderId,
  );

  usePageTitle(t('payment.result.failedTitle'));

  const dashboardPath = getPostLoginPath(user?.role ?? UserRole.GUEST);
  const retryPath = order?.packageId
    ? `/candidate/payment?packageId=${encodeURIComponent(order.packageId)}`
    : '/candidate/subscription';
  const failureReason = order?.failureReason?.trim() || null;

  return (
    <PaymentOrderQueryStates
      isInvalidOrderId={isInvalidOrderId}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
    >
      {order ? (
        <PaymentResultShell
          icon={XCircle}
          variant="failed"
          title={t('payment.result.failedTitle')}
          description={t('payment.result.failedDescription')}
        >
          {failureReason ? (
            <p className="rounded-xl border border-error/25 bg-error-bg px-4 py-3 text-sm text-error frame-satin-soft">
              {failureReason}
            </p>
          ) : null}
          <PaymentOrderDetailCard order={order} variant="failed" />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to={retryPath} className="btn-primary flex-1 text-center">
              {t('payment.result.retryPayment')}
            </Link>
            <Link to={dashboardPath} className="btn-secondary flex-1 text-center">
              {t('payment.result.backToDashboard')}
            </Link>
          </div>
        </PaymentResultShell>
      ) : null}
    </PaymentOrderQueryStates>
  );
}
