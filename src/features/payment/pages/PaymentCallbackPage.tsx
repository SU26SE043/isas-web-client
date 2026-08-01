import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { paymentService } from '../services/payment.service';
import { useInvalidateTokenWallet } from '../hooks/useTokenWallet';
import { isValidOrderId, resolveOrderIdFromSearch } from '../utils/resolveOrderId';
import { isPaymentSuccessStatus } from '../utils/paymentOrderOutcome';
import { paymentKeys } from '../hooks/useMyPaymentOrders';

export const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = resolveOrderIdFromSearch(searchParams) || sessionStorage.getItem('payment.return.orderId') || '';
  const navigate = useNavigate();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const invalidateWallet = useInvalidateTokenWallet();

  useEffect(() => {
    if (!isValidOrderId(orderId)) {
      navigate('/payment/failed', { replace: true });
      return;
    }

    let active = true;
    void paymentService.pollOrderStatus(orderId)
      .then((status) => {
        if (!active) return;
        if (isPaymentSuccessStatus(status)) {
          invalidateWallet();
          void queryClient.invalidateQueries({ queryKey: paymentKeys.orders() });
          void queryClient.invalidateQueries({ queryKey: paymentKeys.account() });
          void queryClient.invalidateQueries({ queryKey: paymentKeys.subscription() });
          void queryClient.invalidateQueries({ queryKey: paymentKeys.transactions() });
          navigate(`/payment/success?orderId=${encodeURIComponent(orderId)}`, { replace: true });
          return;
        }
        navigate(`/payment/failed?orderId=${encodeURIComponent(orderId)}`, { replace: true });
      })
      .catch(() => {
        if (active) navigate(`/payment/failed?orderId=${encodeURIComponent(orderId)}`, { replace: true });
      });

    return () => {
      active = false;
    };
  }, [invalidateWallet, navigate, orderId, queryClient]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base px-4">
      <div className="frame-satin flex w-full max-w-lg flex-col items-center gap-3 rounded-2xl bg-surface-raised p-8 text-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">{t('payment.callback.processing')}</p>
      </div>
    </div>
  );
};
