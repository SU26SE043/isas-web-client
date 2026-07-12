import { Check, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { BillingCycle, OrgPlanId, SubscriptionPlan } from '../types/employerBilling.types';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  cycle: BillingCycle;
  activePlanId: OrgPlanId | null;
  isSubmitting: boolean;
  onSelect: (planId: OrgPlanId) => void;
}

export function SubscriptionPlanCard({ plan, cycle, activePlanId, isSubmitting, onSelect }: SubscriptionPlanCardProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const amount = cycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const isActive = activePlanId === plan.id;

  return (
    <Card className={cn('border border-subtle bg-surface-raised', isActive && 'ring-2 ring-foreground/40')}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{t(plan.nameKey)}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{t(plan.descriptionKey)}</p>
          </div>
          {isActive ? (
            <span className="rounded-full border border-subtle px-2 py-1 text-xs text-foreground">
              {t('employerBilling.plan.current')}
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex h-full flex-col gap-5">
        <div>
          <p className="text-3xl font-semibold text-foreground">
            {new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {cycle === 'annual' ? t('employerBilling.plan.perYear') : t('employerBilling.plan.perMonth')}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-subtle bg-surface-overlay p-3">
            <dt className="text-muted-foreground">{t('employerBilling.plan.seats')}</dt>
            <dd className="mt-1 font-semibold text-foreground">{plan.seats}</dd>
          </div>
          <div className="rounded-lg border border-subtle bg-surface-overlay p-3">
            <dt className="text-muted-foreground">{t('employerBilling.plan.credits')}</dt>
            <dd className="mt-1 font-semibold text-foreground">{plan.campaignCredits}</dd>
          </div>
        </dl>

        <ul className="space-y-2">
          {plan.featureKeys.map((featureKey) => (
            <li key={featureKey} className="flex gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              <span>{t(featureKey)}</span>
            </li>
          ))}
        </ul>

        <Button type="button" className="mt-auto w-full" loading={isSubmitting} onClick={() => onSelect(plan.id)}>
          <CreditCard aria-hidden />
          {isActive ? t('employerBilling.plan.renew') : t('employerBilling.plan.select')}
        </Button>
      </CardContent>
    </Card>
  );
}
