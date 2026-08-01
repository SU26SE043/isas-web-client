import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { paymentService } from '../services/payment.service';
import type { CreditPackage, SubscriptionPlan } from '../types/payment.types';

export const SubscriptionPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void Promise.all([paymentService.listPackages(), paymentService.listSubscriptionPlans()]).then(
      ([nextPackages, nextPlans]) => {
        if (!active) return;
        setPackages(nextPackages);
        setPlans(nextPlans);
        setSelectedPackageId(
          nextPackages.find((item) => item.popular)?.id ?? nextPackages[0]?.id ?? '',
        );
        setIsLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const handleCheckout = (packageId: string) => {
    navigate(`/candidate/payment?packageId=${encodeURIComponent(packageId)}`);
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
          <div className="grid gap-4 md:grid-cols-3">
            {packages.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`rounded-xl border p-5 text-left transition ${
                  selectedPackageId === item.id
                    ? 'border-foreground bg-surface-elevated'
                    : 'border-subtle bg-surface-raised hover:border-strong'
                }`}
                onClick={() => setSelectedPackageId(item.id)}
              >
                <span className="block text-lg font-semibold text-foreground">
                  {language === 'vi' ? item.nameVi : item.name}
                </span>
                <span className="mt-3 block text-3xl font-semibold text-foreground">
                  ${item.priceUsd.toFixed(2)}
                </span>
                <span className="mt-2 block text-sm text-muted-foreground">
                  {t('payment.plans.tokenCount').replace('{count}', item.tokens.toLocaleString())}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn-primary"
            disabled={!selectedPackageId}
            onClick={() => handleCheckout(selectedPackageId)}
          >
            {t('payment.plans.continueCheckout')}
          </button>
        </section>

        <section className="space-y-4">
          <h2 className="heading-secondary text-xl text-foreground">{t('payment.plans.subscription')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className="rounded-xl border border-subtle bg-surface-raised p-5"
              >
                <h3 className="text-lg font-semibold text-foreground">
                  {language === 'vi' ? plan.nameVi : plan.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {language === 'vi' ? plan.descriptionVi : plan.description}
                </p>
                <p className="mt-4 text-2xl font-semibold text-foreground">
                  ${plan.priceUsdMonthly.toFixed(2)}
                </p>
                <button
                  type="button"
                  className="btn-secondary mt-4"
                  onClick={() => handleCheckout(plan.id)}
                >
                  {t('payment.plans.subscribe')}
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
