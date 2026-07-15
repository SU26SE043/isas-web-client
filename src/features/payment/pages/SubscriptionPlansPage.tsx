import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { PackageCard } from '../components/PackageCard';
import { SubscriptionPlanCard } from '../components/SubscriptionPlanCard';
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
      ([pkg, subs]) => {
        if (!active) return;
        setPackages(pkg);
        setPlans(subs);
        setSelectedPackageId(pkg.find((item) => item.popular)?.id ?? pkg[0]?.id ?? '');
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
              <PackageCard
                key={item.id}
                item={item}
                language={language}
                selected={selectedPackageId === item.id}
                onSelect={setSelectedPackageId}
              />
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
              <SubscriptionPlanCard
                key={plan.id}
                plan={plan}
                language={language}
                onSelect={handleCheckout}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
