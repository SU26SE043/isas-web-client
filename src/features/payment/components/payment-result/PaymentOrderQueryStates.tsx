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
          className="w-full max-w-lg animate-in fade-in-0 zoom-in-95 duration-300 frame-satin"
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
        <div className="w-full max-w-lg space-y-6 rounded-2xl bg-surface-raised p-6 frame-satin sm:p-8">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="size-20 rounded-full" />
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="space-y-3 rounded-xl bg-surface-overlay p-4 frame-satin">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner className="size-6" label={t('payment.result.loading')} />
            <p className="text-sm text-text-secondary">{t('payment.result.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base px-4 py-10">
        <EmptyState
          className="w-full max-w-lg animate-in fade-in-0 zoom-in-95 duration-300 frame-satin"
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
