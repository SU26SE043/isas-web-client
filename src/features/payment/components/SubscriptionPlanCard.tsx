import { useLanguage } from '@/shared/languages';
import type { SubscriptionPlan } from '../types/payment.types';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  language: 'vi' | 'en';
  onSelect: (planId: string) => void;
}

export function SubscriptionPlanCard({ plan, language, onSelect }: SubscriptionPlanCardProps) {
  const { t } = useLanguage();
  const title = language === 'vi' ? plan.nameVi : plan.name;
  const description = language === 'vi' ? plan.descriptionVi : plan.description;

  return (
    <article className="rounded-xl border border-subtle bg-surface-raised p-5">
      <h3 className="heading-secondary text-lg text-foreground">{title}</h3>
      <p className="body-text mt-2 text-sm text-muted-foreground">{description}</p>
      <p className="mt-4 text-3xl font-semibold text-foreground">${plan.priceUsdMonthly}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('payment.plans.tokensPerMonth').replace('{count}', plan.tokensPerMonth.toLocaleString())}
      </p>
      <button type="button" className="btn-primary mt-5" onClick={() => onSelect(plan.id)}>
        {t('payment.plans.subscribe')}
      </button>
    </article>
  );
}
