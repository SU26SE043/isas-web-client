import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { usePurchasePackage } from '../hooks/usePurchasePackage';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get('packageId') ?? '';
  const { t } = useLanguage();
  const { purchasePackage, error, isPurchasing } = usePurchasePackage();
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!packageId || started) return;
    setStarted(true);
    void purchasePackage(packageId);
  }, [packageId, purchasePackage, started]);

  if (!packageId) {
    return (
      <div className="h-full overflow-y-auto bg-surface-base">
        <div className="page-container page-section mx-auto max-w-xl space-y-6">
          <p className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">
            {t('payment.checkout.missingPackage')}
          </p>
          <Link to="/candidate/subscription" className="btn-secondary inline-flex">
            {t('payment.checkout.backToPlans')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-surface-base px-4">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-subtle bg-surface-raised p-8 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">
          {isPurchasing ? t('payment.checkout.redirecting') : t('payment.checkout.subtitle')}
        </p>
        {error ? (
          <p className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">{error}</p>
        ) : null}
        {error ? (
          <Link to="/candidate/subscription" className="btn-secondary inline-flex">
            {t('payment.checkout.backToPlans')}
          </Link>
        ) : null}
      </div>
    </div>
  );
};
