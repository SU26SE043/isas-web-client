import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import { isValidOrderId, resolveOrderIdFromSearch } from '../utils/resolveOrderId';
import { getOrderPaymentStatus, isPaymentSuccessStatus } from '../utils/paymentOrderOutcome';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = resolveOrderIdFromSearch(searchParams);
  const isInvalidOrderId = !isValidOrderId(orderId);
  const { t } = useLanguage();
  const { user } = useAuth();
  const invalidateWallet = useInvalidateTokenWallet();
  const { data: order, isLoading, isError, error, refetch, isSuccess } = usePaymentOrder(
    isInvalidOrderId ? null : orderId,
  );

  usePageTitle(t('payment.result.successTitle'));

  useEffect(() => {
    if (!isSuccess || !order || isInvalidOrderId) return;

    const paymentStatus = getOrderPaymentStatus(order);
    if (!isPaymentSuccessStatus(paymentStatus)) {
      navigate(`/payment/failed?orderId=${encodeURIComponent(orderId)}`, { replace: true });
      return;
    }

    invalidateWallet();
  }, [isSuccess, order, isInvalidOrderId, orderId, navigate, invalidateWallet]);

  const dashboardPath = getPostLoginPath(user?.role ?? UserRole.GUEST);
  const canShowSuccess =
    isSuccess && order && isPaymentSuccessStatus(getOrderPaymentStatus(order));

  return (
    <PaymentOrderQueryStates
      isInvalidOrderId={isInvalidOrderId}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
    >
      {canShowSuccess ? (
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
