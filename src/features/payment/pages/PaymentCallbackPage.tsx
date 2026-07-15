import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { PaymentStatusBanner } from '../components/PaymentStatusBanner';
import { paymentService } from '../services/payment.service';
import { useInvalidateTokenWallet } from '../hooks/useTokenWallet';

type CallbackState = 'processing' | 'success' | 'failed' | 'cancelled';

export const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';
  const status = (searchParams.get('status') ?? 'FAILED').toUpperCase();
  const { t } = useLanguage();
  const [state, setState] = useState<CallbackState>('processing');
  const [tokensAdded, setTokensAdded] = useState(0);
  const invalidateWallet = useInvalidateTokenWallet();

  useEffect(() => {
    if (!orderId) {
      setState('failed');
      return;
    }

    let active = true;
    const normalizedStatus =
      status === 'PAID' ? 'PAID' : status === 'CANCELLED' ? 'CANCELLED' : 'FAILED';

    void paymentService.completeOrder(orderId, normalizedStatus).then((result) => {
      if (!active) return;
      if (result.order.status === 'paid') {
        setTokensAdded(result.order.tokens);
        invalidateWallet();
        setState('success');
        return;
      }
      setState(result.order.status === 'cancelled' ? 'cancelled' : 'failed');
    }).catch(() => {
      if (active) setState('failed');
    });

    return () => {
      active = false;
    };
  }, [orderId, status]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base px-4">
      <div className="w-full max-w-lg space-y-6 rounded-xl border border-subtle bg-surface-raised p-8">
        {state === 'processing' ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">{t('payment.callback.processing')}</p>
          </div>
        ) : null}

        {state === 'success' ? (
          <>
            <PaymentStatusBanner
              variant="success"
              description={t('payment.callback.successDescription').replace('{count}', tokensAdded.toLocaleString())}
            />
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

        {state === 'failed' ? (
          <>
            <PaymentStatusBanner variant="error" />
            <Link to="/candidate/subscription" className="btn-primary inline-flex">
              {t('payment.callback.tryAgain')}
            </Link>
          </>
        ) : null}

        {state === 'cancelled' ? (
          <>
            <PaymentStatusBanner variant="pending" title={t('payment.callback.cancelledTitle')} />
            <Link to="/candidate/subscription" className="btn-secondary inline-flex">
              {t('payment.callback.backToPlans')}
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
};
