import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import { SubscriptionPlanCard } from '../components/SubscriptionPlanCard';
import { useEmployerBilling } from '../hooks/useEmployerBilling';
import type { BillingCycle, OrgPlanId } from '../types/employerBilling.types';

export function EmployerSubscriptionPage() {
  const { t } = useLanguage();
  const { account, plans, isLoading, selectPlan } = useEmployerBilling();
  const [cycle, setCycle] = useState<BillingCycle>('annual');
  const [submittingPlanId, setSubmittingPlanId] = useState<OrgPlanId | null>(null);
  const [messageKey, setMessageKey] = useState<string | null>(null);

  const handleSelect = async (planId: OrgPlanId) => {
    setSubmittingPlanId(planId);
    setMessageKey(null);
    try {
      const result = await selectPlan(planId, cycle);
      setMessageKey(result.messageKey);
    } finally {
      setSubmittingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-base px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{t('employerBilling.subscription.eyebrow')}</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">{t('employerBilling.subscription.title')}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t('employerBilling.subscription.subtitle')}</p>
          </div>
          <div className="flex rounded-lg border border-subtle bg-surface-raised p-1">
            {(['monthly', 'annual'] as BillingCycle[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCycle(item)}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-medium transition',
                  cycle === item ? 'bg-surface-elevated text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t(`employerBilling.cycle.${item}`)}
              </button>
            ))}
          </div>
        </header>

        {messageKey ? (
          <Alert variant="success">
            <AlertDescription>{t(messageKey)}</AlertDescription>
          </Alert>
        ) : null}

        {account?.subscriptionStatus === 'grace_period' ? (
          <Alert variant="error">
            <AlertDescription>{t('employerBilling.subscription.graceBlock')}</AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-96 animate-pulse rounded-xl border border-subtle bg-surface-raised" />
              ))
            : plans.map((plan) => (
                <SubscriptionPlanCard
                  key={plan.id}
                  plan={plan}
                  cycle={cycle}
                  activePlanId={account?.planId ?? null}
                  isSubmitting={submittingPlanId === plan.id}
                  onSelect={handleSelect}
                />
              ))}
        </section>

        <div className="flex flex-col gap-3 rounded-xl border border-subtle bg-surface-raised p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-foreground">{t('employerBilling.subscription.afterPurchase')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('employerBilling.subscription.afterPurchaseHint')}</p>
          </div>
          <Link to="/employer/billing" className={buttonVariants({ variant: 'outline' })}>
            {t('employerBilling.subscription.viewBilling')}
          </Link>
        </div>
      </div>
    </div>
  );
}
