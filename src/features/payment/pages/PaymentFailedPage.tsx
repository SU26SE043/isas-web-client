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
import {
  resolveFailedResultCopy,
  translateFailedResultCopy,
} from '../utils/resolveFailedResultCopy';

export function PaymentFailedPage() {
  const [searchParams] = useSearchParams();
  const orderId = resolveOrderIdFromSearch(searchParams);
  const isInvalidOrderId = !isValidOrderId(orderId);
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: order, isLoading, isError, error, refetch } = usePaymentOrder(
    isInvalidOrderId ? null : orderId,
  );

  usePageTitle(t('payment.result.incompleteTitle'));

  const dashboardPath = getPostLoginPath(user?.role ?? UserRole.GUEST);
  const failedCopy = order ? translateFailedResultCopy(resolveFailedResultCopy(order), t) : null;
  const retryCheckoutUrl = order?.checkoutUrl ?? null;
  const canRetryWithCheckout = Boolean(retryCheckoutUrl);
  const canRetryWithPackage = Boolean(order?.packageId) && !canRetryWithCheckout;

  return (
    <PaymentOrderQueryStates
      isInvalidOrderId={isInvalidOrderId}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
    >
      {order && failedCopy ? (
        <PaymentResultShell
          icon={XCircle}
          iconClassName="text-error"
          title={failedCopy.title}
          description={failedCopy.description}
        >
          {failedCopy.reason ? (
            <p className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">
              {failedCopy.reason}
            </p>
          ) : null}
          <PaymentOrderDetailCard order={order} />
          <div className="flex flex-col gap-3 sm:flex-row">
            {canRetryWithCheckout ? (
              <a href={retryCheckoutUrl!} className="btn-primary text-center">
                {t('payment.result.retryPayment')}
              </a>
            ) : null}
            {canRetryWithPackage ? (
              <Link
                to={`/candidate/payment?packageId=${encodeURIComponent(order.packageId)}`}
                className="btn-primary text-center"
              >
                {t('payment.result.retryPayment')}
              </Link>
            ) : null}
            <Link to={dashboardPath} className="btn-secondary text-center">
              {t('payment.result.backToDashboard')}
            </Link>
          </div>
        </PaymentResultShell>
      ) : null}
    </PaymentOrderQueryStates>
  );
}
