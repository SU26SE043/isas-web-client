import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { usesMockData } from '@/shared/mock';
import { paymentService } from '../services/payment.service';
import { useInvalidateTokenWallet } from '../hooks/useTokenWallet';
import { resolveOrderIdFromSearch } from '../utils/resolveOrderId';

function buildResultPath(
  outcome: 'success' | 'failed',
  orderId: string,
  reason?: string,
): string {
  const params = new URLSearchParams({ orderId });
  if (reason) {
    params.set('reason', reason);
  }
  return `/payment/${outcome}?${params.toString()}`;
}

export const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = resolveOrderIdFromSearch(searchParams);
  const legacyStatus = (searchParams.get('status') ?? '').toUpperCase();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const invalidateWallet = useInvalidateTokenWallet();

  useEffect(() => {
    if (!orderId) {
      navigate(buildResultPath('failed', ''), { replace: true });
      return;
    }

    let active = true;

    const redirectSuccess = () => {
      if (!active) return;
      invalidateWallet();
      navigate(buildResultPath('success', orderId), { replace: true });
    };

    const redirectFailed = (reason?: string) => {
      if (!active) return;
      navigate(buildResultPath('failed', orderId, reason), { replace: true });
    };

    const completeMockOrder = async () => {
      const normalizedStatus =
        legacyStatus === 'PAID' ? 'PAID' : legacyStatus === 'CANCELLED' ? 'CANCELLED' : 'FAILED';
      const result = await paymentService.completeOrder(orderId, normalizedStatus);
      if (!active) return;
      if (result.order.status === 'paid') {
        redirectSuccess();
        return;
      }
      const reason =
        result.order.status === 'cancelled'
          ? t('payment.result.cancelledReason')
          : t('payment.result.failedReason');
      redirectFailed(reason);
    };

    const pollLiveOrder = async () => {
      const finalStatus = await paymentService.pollOrderStatus(orderId);
      if (!active) return;

      if (finalStatus === 'Paid') {
        if (usesMockData('payment')) {
          await paymentService.completeOrder(orderId, 'PAID').catch(() => undefined);
        }
        redirectSuccess();
        return;
      }

      if (finalStatus === 'Cancelled' || finalStatus === 'Canceled') {
        redirectFailed(t('payment.result.cancelledReason'));
        return;
      }

      redirectFailed(t('payment.result.failedReason'));
    };

    void (async () => {
      try {
        if (usesMockData('payment') && legacyStatus) {
          await completeMockOrder();
          return;
        }
        await pollLiveOrder();
      } catch {
        if (!active) return;
        if (usesMockData('payment') && legacyStatus) {
          try {
            await completeMockOrder();
          } catch {
            if (active) redirectFailed(t('payment.result.failedReason'));
          }
          return;
        }
        redirectFailed(t('payment.result.failedReason'));
      }
    })();

    return () => {
      active = false;
    };
  }, [orderId, legacyStatus, invalidateWallet, navigate, t]);

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
