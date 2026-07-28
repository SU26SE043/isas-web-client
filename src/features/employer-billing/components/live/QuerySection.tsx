import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';

export function QuerySection({
  isLoading,
  isError,
  onRetry,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  children: ReactNode;
}) {
  const { t } = useLanguage();
  if (isLoading) {
    return (
      <div className="frame-satin space-y-4 rounded-2xl bg-surface-raised p-6" aria-label={t('employerBilling.live.loading')}>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-16 w-32" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="frame-satin rounded-2xl bg-surface-raised p-6">
        <AlertCircle className="mb-3 size-6 text-error" aria-hidden />
        <p className="text-sm text-muted-foreground">{t('employerBilling.errors.generic')}</p>
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          {t('employerBilling.live.retry')}
        </Button>
      </div>
    );
  }
  return <>{children}</>;
}

