import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useLanguage } from '@/shared/languages';
import { resolvePaymentOrderErrorMessage } from '../../utils/resolvePaymentOrderError';

interface PaymentOrderQueryStatesProps {
  isInvalidOrderId: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
  children: ReactNode;
}

export function PaymentOrderQueryStates({
  isInvalidOrderId,
  isLoading,
  isError,
  error,
  onRetry,
  children,
}: PaymentOrderQueryStatesProps) {
  const { t } = useLanguage();

  if (isInvalidOrderId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base px-4 py-10">
        <EmptyState
          className="w-full max-w-lg animate-in fade-in-0 zoom-in-95 duration-300"
          variant="no-results"
          title={t('payment.result.invalidOrderTitle')}
          description={t('payment.result.invalidOrderDescription')}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base px-4 py-10">
        <div className="w-full max-w-lg space-y-4 rounded-xl border border-subtle bg-surface-raised p-8">
          <div className="flex flex-col items-center gap-3">
            <Spinner className="size-8" label={t('payment.result.loading')} />
            <p className="text-sm text-muted-foreground">{t('payment.result.loading')}</p>
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base px-4 py-10">
        <EmptyState
          className="w-full max-w-lg animate-in fade-in-0 zoom-in-95 duration-300"
          variant="no-data"
          title={t('payment.result.errorTitle')}
          description={resolvePaymentOrderErrorMessage(error, t)}
          action={
            <Button type="button" onClick={onRetry}>
              <AlertCircle className="size-4" aria-hidden />
              {t('payment.result.retry')}
            </Button>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
}
