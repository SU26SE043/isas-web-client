import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useLanguage } from '@/shared/languages';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getPostLoginPath } from '@/features/auth/utils/getPostLoginPath';
import { UserRole } from '@/features/auth/types/auth.types';
import { useInvalidateTokenWallet } from '../hooks/useTokenWallet';
import { usePaymentOrder } from '../hooks/usePaymentOrder';
import { PaymentOrderDetailCard } from '../components/payment-result/PaymentOrderDetailCard';
import { PaymentOrderQueryStates } from '../components/payment-result/PaymentOrderQueryStates';
import { PaymentResultShell } from '../components/payment-result/PaymentResultShell';
import { isResolvableOrderId, resolveOrderIdFromSearch } from '../utils/resolveOrderId';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = resolveOrderIdFromSearch(searchParams);
  const isInvalidOrderId = !isResolvableOrderId(orderId);
  const { t } = useLanguage();
  const { user } = useAuth();
  const invalidateWallet = useInvalidateTokenWallet();
  const { data: order, isLoading, isError, error, refetch, isSuccess } = usePaymentOrder(
    isInvalidOrderId ? null : orderId,
  );

  usePageTitle(t('payment.result.successTitle'));

  useEffect(() => {
    if (isSuccess && order) {
      invalidateWallet();
    }
  }, [isSuccess, order, invalidateWallet]);

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
          icon={CheckCircle2}
          iconClassName="text-success"
          title={t('payment.result.successTitle')}
          description={t('payment.result.successDescription')}
        >
          <PaymentOrderDetailCard order={order} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/candidate/credits" className="btn-primary text-center">
              {t('payment.result.viewOrder')}
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
