import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { paymentService } from '@/features/payment/services/payment.service';
import { PRACTICE_RESERVE_ESTIMATE } from '@/features/payment/constants';
import { TOKEN_WALLET_QUERY_KEY } from '@/features/payment/hooks/useTokenWallet';
import { queryClient } from '@/shared/query/queryClient';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';

const DEFAULT_SESSION_ID = 'session-123';

export function PracticeEntryPage() {
  const { t } = useLanguage();
  const reset = useInterviewFlowStore((state) => state.reset);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    reset(DEFAULT_SESSION_ID);

    void paymentService
      .reserveTokens(DEFAULT_SESSION_ID, PRACTICE_RESERVE_ESTIMATE)
      .then(() => {
        void queryClient.invalidateQueries({ queryKey: TOKEN_WALLET_QUERY_KEY });
        if (active) setIsReady(true);
      })
      .catch(() => {
        if (active) setHasError(true);
      });

    return () => {
      active = false;
    };
  }, [reset]);

  if (hasError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base px-4">
        <div className="w-full max-w-md space-y-4 rounded-xl border border-subtle bg-surface-raised p-6 text-center">
          <h1 className="heading-primary text-xl text-foreground">{t('payment.wallet.insufficientTitle')}</h1>
          <p className="body-text text-sm text-muted-foreground">
            {t('payment.wallet.insufficientReserve').replace('{amount}', PRACTICE_RESERVE_ESTIMATE.toLocaleString())}
          </p>
          <Link to="/candidate/credits" className="btn-primary inline-flex">
            {t('payment.wallet.buyTokens')}
          </Link>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return <Navigate to={`/interview/${DEFAULT_SESSION_ID}/prepare`} replace />;
}
