import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { paymentService } from '../services/payment.service';
import type { PaymentOrder } from '../types/payment.types';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get('packageId') ?? '';
  const { t, language } = useLanguage();
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!packageId) {
      setError(t('payment.checkout.missingPackage'));
      setIsLoading(false);
      return;
    }

    let active = true;
    void paymentService
      .createOrder(packageId)
      .then((result) => {
        if (active) setOrder(result.order);
      })
      .catch(() => {
        if (active) setError(t('payment.checkout.error'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [packageId, t]);

  const handlePay = () => {
    if (!order?.checkoutUrl) return;
    setIsRedirecting(true);
    sessionStorage.setItem('payment.return.orderId', order.orderId);
    sessionStorage.setItem('payment.return.packageId', order.packageId);
    window.location.assign(order.checkoutUrl);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-xl space-y-6">
        <header className="space-y-2">
          <h1 className="heading-primary text-3xl text-foreground">{t('payment.checkout.title')}</h1>
          <p className="body-text text-sm text-muted-foreground">{t('payment.checkout.subtitle')}</p>
        </header>

        {error ? (
          <p className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">
            {error}
          </p>
        ) : null}

        {order ? (
          <section className="space-y-4 rounded-xl border border-subtle bg-surface-raised p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">{t('payment.checkout.package')}</span>
                <span className="font-medium text-foreground">
                  {language === 'vi' ? order.packageNameVi : order.packageName}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">{t('payment.checkout.tokens')}</span>
                <span className="font-medium text-foreground">{order.tokens > 0 ? order.tokens.toLocaleString() : '—'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">{t('payment.checkout.total')}</span>
                <span className="text-lg font-semibold text-foreground">
                  {formatVnd(order.amountVnd ?? 0)}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{t('payment.checkout.payosHint')}</p>
            <button
              type="button"
              className="btn-primary w-full"
              disabled={isRedirecting}
              onClick={handlePay}
            >
              {isRedirecting ? t('payment.checkout.redirecting') : t('payment.checkout.payWithPayos')}
            </button>
          </section>
        ) : null}

        <Link to="/candidate/subscription" className="btn-secondary inline-flex">
          {t('payment.checkout.backToPlans')}
        </Link>
      </div>
    </div>
  );
};

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}
