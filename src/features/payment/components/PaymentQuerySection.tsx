import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';

export function PaymentQuerySection({
  isLoading,
  isError,
  onRetry,
  errorMessage,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  errorMessage?: string;
  children: ReactNode;
}) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="frame-satin space-y-4 rounded-2xl bg-surface-raised p-6" aria-label={t('payment.result.loadError')}>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="frame-satin rounded-2xl bg-surface-raised p-6">
        <AlertCircle className="mb-3 size-6 text-error" aria-hidden />
        <p className="text-sm text-muted-foreground">{errorMessage ?? t('payment.result.loadError')}</p>
        <button type="button" className="btn-secondary mt-4" onClick={onRetry}>
          {t('payment.result.retry')}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
