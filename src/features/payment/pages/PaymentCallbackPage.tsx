import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { paymentService } from '../services/payment.service';
import { useInvalidateTokenWallet } from '../hooks/useTokenWallet';
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

  useEffect(() => {
    if (!isValidOrderId(orderId)) {
      navigate('/payment/failed', { replace: true });
      return;
    }

    let active = true;

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
  }, [orderId, invalidateWallet, navigate]);

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
