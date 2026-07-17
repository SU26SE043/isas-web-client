import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { paymentService } from '../services/payment.service';
import { usePurchasePackage } from '../hooks/usePurchasePackage';
import type { PackageResponse } from '../types/payment.types';

function formatVnd(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(amount);
}

function CatalogPackageCard({
  pkg,
  selected,
  onSelect,
  locale,
}: {
  pkg: PackageResponse;
  selected: boolean;
  onSelect: (packageId: string) => void;
  locale: string;
}) {
  const { t } = useLanguage();
  const credits = pkg.interviewCredits ?? 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(pkg.id)}
      className={[
        'flex h-full w-full flex-col rounded-xl border p-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
        selected ? 'border-default bg-surface-elevated' : 'border-subtle bg-surface-raised hover:bg-surface-overlay',
      ].join(' ')}
    >
      <h3 className="heading-secondary text-lg text-foreground">{pkg.name}</h3>
      <p className="body-text mt-2 flex-1 text-sm text-muted-foreground">
        {t('pricing.packageDescription').replace('{credits}', String(credits))}
      </p>
      <p className="mt-4 text-3xl font-semibold text-foreground">{formatVnd(pkg.priceVnd, locale)}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('payment.plans.tokenCount').replace('{count}', credits.toLocaleString())}
      </p>
    </button>
  );
}

export const SubscriptionPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi' : 'en';
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const { purchasePackage, error, isPurchasing } = usePurchasePackage();

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['payment', 'catalog-packages'],
    queryFn: () => paymentService.listCatalogPackages(),
  });

  useEffect(() => {
    if (!selectedPackageId && packages.length > 0) {
      setSelectedPackageId(packages[0].id);
    }
  }, [packages, selectedPackageId]);

  const handleBuyPackage = () => {
    if (!selectedPackageId) return;
    void purchasePackage(selectedPackageId);
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
      <div className="page-container page-section mx-auto max-w-6xl space-y-8">
        <header className="space-y-2">
          <h1 className="heading-primary text-3xl text-foreground">{t('payment.plans.title')}</h1>
          <p className="body-text text-sm text-muted-foreground">{t('payment.plans.subtitle')}</p>
        </header>

        <section className="space-y-4">
          <h2 className="heading-secondary text-xl text-foreground">{t('payment.plans.oneTime')}</h2>
          {error ? (
            <p className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">{error}</p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-3">
            {packages.map((item) => (
              <CatalogPackageCard
                key={item.id}
                pkg={item}
                locale={locale}
                selected={selectedPackageId === item.id}
                onSelect={setSelectedPackageId}
              />
            ))}
          </div>
          <button
            type="button"
            className="btn-primary"
            disabled={!selectedPackageId || isPurchasing}
            onClick={handleBuyPackage}
          >
            {isPurchasing ? t('payment.checkout.redirecting') : t('payment.plans.buyPackage')}
          </button>
          <button
            type="button"
            className="btn-ghost ml-3"
            onClick={() => navigate('/pricing')}
          >
            {t('payment.plans.viewPublicPricing')}
          </button>
        </section>
      </div>
    </div>
  );
};
