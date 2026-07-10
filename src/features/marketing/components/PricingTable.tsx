import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useLanguage } from '@/shared/languages';

interface PricingPlan {
  id: string;
  nameKey: string;
  priceKey: string;
  descriptionKey: string;
  featureKeys: string[];
  popular?: boolean;
  contact?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    nameKey: 'pricing.free.name',
    priceKey: 'pricing.free.price',
    descriptionKey: 'pricing.free.description',
    featureKeys: ['pricing.free.feature1', 'pricing.free.feature2', 'pricing.free.feature3'],
  },
  {
    id: 'starter',
    nameKey: 'pricing.starter.name',
    priceKey: 'pricing.starter.price',
    descriptionKey: 'pricing.starter.description',
    featureKeys: ['pricing.starter.feature1', 'pricing.starter.feature2', 'pricing.starter.feature3'],
    popular: true,
  },
  {
    id: 'pro',
    nameKey: 'pricing.pro.name',
    priceKey: 'pricing.pro.price',
    descriptionKey: 'pricing.pro.description',
    featureKeys: ['pricing.pro.feature1', 'pricing.pro.feature2', 'pricing.pro.feature3'],
  },
  {
    id: 'enterprise',
    nameKey: 'pricing.enterprise.name',
    priceKey: 'pricing.enterprise.price',
    descriptionKey: 'pricing.enterprise.description',
    featureKeys: ['pricing.enterprise.feature1', 'pricing.enterprise.feature2', 'pricing.enterprise.feature3'],
    contact: true,
  },
];

export const PricingTable: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => (
        <article
          key={plan.id}
          className={`relative flex flex-col rounded-xl border bg-surface-raised p-6 ${
            plan.popular ? 'border-default shadow-md' : 'border-subtle'
          }`}
        >
          {plan.popular && (
            <span className="text-label absolute -top-3 left-6 rounded-full bg-surface-elevated px-3 py-1 text-xs">
              {t('pricing.popular')}
            </span>
          )}
          <h3 className="heading-secondary mb-2 text-lg">{t(plan.nameKey)}</h3>
          <p className="body-text mb-4 text-sm">{t(plan.descriptionKey)}</p>
          <div className="mb-6">
            <span className="text-3xl font-bold text-foreground">{t(plan.priceKey)}</span>
            {!plan.contact && (
              <span className="text-muted-foreground ml-1 text-sm">
                VND ({t('pricing.oneTime')})
              </span>
            )}
          </div>
          <ul className="mb-8 flex-grow space-y-3">
            {plan.featureKeys.map((key) => (
              <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-foreground" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
          {plan.contact ? (
            <Link to="/enterprise" className="btn-secondary w-full text-center">
              {t('pricing.ctaContact')}
            </Link>
          ) : (
            <Link to="/register" className={`w-full text-center ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
              {t('pricing.cta')}
            </Link>
          )}
        </article>
      ))}
    </div>
  );
};
