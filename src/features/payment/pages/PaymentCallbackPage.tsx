import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { paymentService } from '../services/payment.service';
import { useInvalidateTokenWallet } from '../hooks/useTokenWallet';
import { usesMockData } from '@/shared/mock';
import { isValidOrderId, resolveOrderIdFromSearch } from '../utils/resolveOrderId';
import {
  getOrderPaymentStatus,
  isPaymentSuccessStatus,
} from '../utils/paymentOrderOutcome';

function buildResultPath(outcome: 'success' | 'failed', orderId: string): string {
  return `/payment/${outcome}?orderId=${encodeURIComponent(orderId)}`;
}

export const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = resolveOrderIdFromSearch(searchParams);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const invalidateWallet = useInvalidateTokenWallet();
  const mockMode = usesMockData('payment');
  const callbackStatus = (searchParams.get('status') ?? 'FAILED').toUpperCase();
  const [mockState, setMockState] = useState<'processing' | 'success' | 'failed' | 'cancelled'>(
    'processing',
  );
  const [tokensAdded, setTokensAdded] = useState(0);

  useEffect(() => {
    if (!isValidOrderId(orderId)) {
      navigate('/payment/failed', { replace: true });
      return;
    }

    let active = true;

    if (mockMode) {
      const normalizedStatus =
        callbackStatus === 'PAID'
          ? 'PAID'
          : callbackStatus === 'CANCELLED'
            ? 'CANCELLED'
            : 'FAILED';
      void paymentService
        .completeOrder(orderId, normalizedStatus)
        .then((result) => {
          if (!active) return;
          if (result.order.status === 'paid') {
            setTokensAdded(result.order.tokens);
            invalidateWallet();
            setMockState('success');
            return;
          }
          setMockState(result.order.status === 'cancelled' ? 'cancelled' : 'failed');
        })
        .catch(() => {
          if (active) setMockState('failed');
        });
      return () => {
        active = false;
      };
    }

    void (async () => {
      try {
        const order = await paymentService.pollOrderDetail(orderId);
        if (!active) return;

        const paymentStatus = getOrderPaymentStatus(order);
        if (isPaymentSuccessStatus(paymentStatus)) {
          invalidateWallet();
          navigate(buildResultPath('success', orderId), { replace: true });
          return;
        }

        navigate(buildResultPath('failed', orderId), { replace: true });
      } catch {
        if (!active) return;
        navigate(buildResultPath('failed', orderId), { replace: true });
      }
    })();

    return () => {
      active = false;
    };
  }, [callbackStatus, orderId, invalidateWallet, mockMode, navigate]);

  if (mockMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base px-4">
        <div className="w-full max-w-lg space-y-6 rounded-xl border border-subtle bg-surface-raised p-8">
          {mockState === 'processing' ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">{t('payment.callback.processing')}</p>
            </div>
          ) : null}
          {mockState === 'success' ? (
            <>
              <div role="status" className="rounded-lg border border-success/30 bg-success-bg p-4">
                <h1 className="text-xl font-semibold text-success">
                  {t('payment.callback.successTitle')}
                </h1>
                <p className="mt-2 text-sm text-foreground">
                  {t('payment.callback.successDescription').replace(
                  '{count}',
                  tokensAdded.toLocaleString(),
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/candidate/credits" className="btn-primary text-center">
                  {t('payment.callback.viewWallet')}
                </Link>
                <Link to="/practice" className="btn-secondary text-center">
                  {t('payment.callback.startPractice')}
                </Link>
              </div>
            </>
          ) : null}
          {mockState === 'failed' ? (
            <>
              <div role="alert" className="rounded-lg border border-error/30 bg-error-bg p-4">
                <h1 className="text-xl font-semibold text-error">
                  {t('payment.callback.errorTitle')}
                </h1>
              </div>
              <Link to="/candidate/subscription" className="btn-primary inline-flex">
                {t('payment.callback.tryAgain')}
              </Link>
            </>
          ) : null}
          {mockState === 'cancelled' ? (
            <>
              <div role="status" className="rounded-lg border border-warning/30 bg-warning-bg p-4">
                <h1 className="text-xl font-semibold text-warning">
                  {t('payment.callback.cancelledTitle')}
                </h1>
              </div>
              <Link to="/candidate/subscription" className="btn-secondary inline-flex">
                {t('payment.callback.backToPlans')}
              </Link>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base px-4">
      <div className="w-full max-w-lg space-y-6 rounded-xl border border-subtle bg-surface-raised p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">{t('payment.callback.processing')}</p>
        </div>
      </div>
    </div>
  );
};
