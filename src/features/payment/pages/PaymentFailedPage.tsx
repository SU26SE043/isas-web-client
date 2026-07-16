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
import { isResolvableOrderId, resolveOrderIdFromSearch } from '../utils/resolveOrderId';

function resolveFailureReason(
  searchParams: URLSearchParams,
  orderReason?: string,
): string | undefined {
  const queryReason = searchParams.get('reason')?.trim();
  return queryReason || orderReason || undefined;
}

export function PaymentFailedPage() {
  const [searchParams] = useSearchParams();
  const orderId = resolveOrderIdFromSearch(searchParams);
  const isInvalidOrderId = !isResolvableOrderId(orderId);
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: order, isLoading, isError, error, refetch } = usePaymentOrder(
    isInvalidOrderId ? null : orderId,
  );

  usePageTitle(t('payment.result.failedTitle'));

  const failureReason = resolveFailureReason(searchParams, order?.failureReason);
  const retryPath = order?.packageId
    ? `/candidate/payment?packageId=${encodeURIComponent(order.packageId)}`
    : '/candidate/subscription';
  const dashboardPath = getPostLoginPath(user?.role ?? UserRole.GUEST);

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
          iconClassName="text-error"
          title={t('payment.result.failedTitle')}
          description={t('payment.result.failedDescription')}
        >
          {failureReason ? (
            <p className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">
              {failureReason}
            </p>
          ) : null}
          {order ? <PaymentOrderDetailCard order={order} /> : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to={retryPath} className="btn-primary text-center">
              {t('payment.result.retryPayment')}
            </Link>
            <Link to={dashboardPath} className="btn-secondary text-center">
              {t('payment.result.backToDashboard')}
            </Link>
          </div>
        </PaymentResultShell>
      ) : null}
    </PaymentOrderQueryStates>
  );
}
