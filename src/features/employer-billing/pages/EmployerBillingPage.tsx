import { AlertTriangle, CalendarClock, Coins, CreditCard, Users, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import { BillingMetricCard } from '../components/BillingMetricCard';
import { MonthlyUsageSummary } from '../components/MonthlyUsageSummary';
import { PaymentMethodForm } from '../components/PaymentMethodForm';
import { TokenUsageByCampaignTable } from '../components/TokenUsageByCampaignTable';
import { useEmployerBilling } from '../hooks/useEmployerBilling';

export function EmployerBillingPage() {
  const { t, language } = useLanguage();
  const {
    account,
    plans,
    campaignUsage,
    monthlyUsage,
    sessionsByCampaign,
    loadingCampaignId,
    isLoading,
    savePaymentMethod,
    loadCampaignSessions,
  } = useEmployerBilling();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const plan = plans.find((item) => item.id === account?.planId);
  const formatDate = (value: string | null | undefined) =>
    value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value)) : t('employerBilling.billing.notScheduled');
  const lowCredit = account ? account.creditBalance <= account.creditLowThreshold : false;

  return (
    <div className="min-h-screen bg-surface-base px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{t('employerBilling.billing.eyebrow')}</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">{t('employerBilling.billing.title')}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t('employerBilling.billing.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/employer/subscription" className={buttonVariants({ variant: 'outline' })}>{t('employerBilling.billing.changePlan')}</Link>
            <Link to="/employer/invoices" className={buttonVariants({ variant: 'outline' })}>{t('employerBilling.billing.viewInvoices')}</Link>
          </div>
        </header>

        {lowCredit ? (
          <Alert variant="warning">
            <AlertTriangle aria-hidden />
            <AlertDescription>{t(account?.creditBalance ? 'employerBilling.billing.lowCredit' : 'employerBilling.billing.emptyCredit')}</AlertDescription>
          </Alert>
        ) : null}

        {account?.subscriptionStatus === 'grace_period' ? (
          <Alert variant="error">
            <AlertDescription>{t('employerBilling.billing.graceBlock')}</AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <BillingMetricCard
            label={t('employerBilling.billing.currentPlan')}
            value={isLoading ? '...' : plan ? t(plan.nameKey) : t('employerBilling.billing.noPlan')}
            hint={t(`employerBilling.status.${account?.subscriptionStatus ?? 'none'}`)}
            icon={<CreditCard className="h-5 w-5" aria-hidden />}
          />
          <BillingMetricCard
            label={t('employerBilling.billing.creditPool')}
            value={account?.creditBalance ?? '...'}
            hint={t('employerBilling.billing.creditPoolHint')}
            icon={<WalletCards className="h-5 w-5" aria-hidden />}
          />
          <BillingMetricCard
            label={t('employerBilling.billing.seats')}
            value={account ? `${account.seatsUsed}/${account.seatsLimit}` : '...'}
            hint={t('employerBilling.billing.seatsHint')}
            icon={<Users className="h-5 w-5" aria-hidden />}
          />
          <BillingMetricCard
            label={t('employerBilling.billing.monthlyTokens')}
            value={account?.monthlyTokensAccrued?.toLocaleString() ?? '...'}
            hint={t('employerBilling.billing.monthlyTokensHint')}
            icon={<Coins className="h-5 w-5" aria-hidden />}
          />
          <BillingMetricCard
            label={t('employerBilling.billing.renewal')}
            value={formatDate(account?.nextRenewalAt)}
            hint={t('employerBilling.billing.renewalHint')}
            icon={<CalendarClock className="h-5 w-5" aria-hidden />}
          />
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t('employerBilling.usage.monthlyTitle')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('employerBilling.usage.monthlySubtitle')}</p>
          </div>
          {isLoading ? (
            <div className="h-32 animate-pulse rounded-xl bg-surface-overlay" />
          ) : (
            <MonthlyUsageSummary periods={monthlyUsage} />
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t('employerBilling.usage.campaignTitle')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('employerBilling.usage.campaignSubtitle')}</p>
          </div>
          {isLoading ? (
            <div className="h-48 animate-pulse rounded-xl bg-surface-overlay" />
          ) : (
            <TokenUsageByCampaignTable
              campaigns={campaignUsage}
              sessionsByCampaign={sessionsByCampaign}
              loadingCampaignId={loadingCampaignId}
              onExpand={loadCampaignSessions}
            />
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Card className="border border-subtle bg-surface-raised">
            <CardHeader>
              <CardTitle>{t('employerBilling.billing.subscriptionCard')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {account?.planId ? (
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t('employerBilling.billing.organization')}</dt>
                    <dd className="font-medium text-foreground">{account.organizationName}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t('employerBilling.billing.billingCycle')}</dt>
                    <dd className="font-medium text-foreground">{t(`employerBilling.cycle.${account.cycle}`)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t('employerBilling.billing.graceEnds')}</dt>
                    <dd className="font-medium text-foreground">{formatDate(account.graceEndsAt)}</dd>
                  </div>
                </dl>
              ) : (
                <div className="rounded-lg border border-subtle bg-surface-overlay p-4">
                  <p className="font-medium text-foreground">{t('employerBilling.billing.noSubscription')}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t('employerBilling.billing.noSubscriptionHint')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-subtle bg-surface-raised">
            <CardHeader>
              <CardTitle>{t('employerBilling.form.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentMethodForm paymentMethod={account?.paymentMethod ?? null} onSave={savePaymentMethod} />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
