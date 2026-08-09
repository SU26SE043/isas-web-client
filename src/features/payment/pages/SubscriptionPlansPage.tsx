import React from 'react';
import { Loader2, Package, Repeat2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/shared/languages';
import { paymentService } from '../services/payment.service';
import type { PackageResponse } from '../types/payment.types';
import { paymentKeys } from '../hooks/useMyPaymentOrders';

export const SubscriptionPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const query = useQuery({ queryKey: paymentKeys.packages(), queryFn: paymentService.listCatalogPackages, retry: false });
  const packages = query.data ?? [];
  const oneTime = packages.filter((item) => Number(item.type) === 1);
  const subscriptions = packages.filter((item) => Number(item.type) === 2);

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-7xl space-y-8">
        <header className="space-y-2">
          <p className="text-label text-muted-foreground">{t('payment.plans.title')}</p>
          <h1 className="heading-primary text-3xl text-foreground">{t('payment.plans.title')}</h1>
          <p className="body-text text-sm text-muted-foreground">{t('payment.plans.subtitle')}</p>
        </header>

        {query.isLoading ? (
          <div className="flex min-h-48 items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden /></div>
        ) : null}
        {query.isError ? (
          <div className="frame-satin rounded-2xl bg-surface-raised p-8 text-center">
            <p className="text-sm text-muted-foreground">{t('payment.plans.loadError')}</p>
            <button type="button" className="btn-secondary mt-4" onClick={() => void query.refetch()}>{t('payment.result.retry')}</button>
          </div>
        ) : null}
        {!query.isLoading && !query.isError && packages.length === 0 ? (
          <div className="frame-satin rounded-2xl bg-surface-raised p-8 text-center"><p className="font-medium text-foreground">{t('payment.plans.empty')}</p></div>
        ) : null}

        {oneTime.length ? <PackageGroup title={t('payment.plans.oneTime')} icon={Package} packages={oneTime} onBuy={(id) => navigate(`/candidate/payment?packageId=${encodeURIComponent(id)}`)} /> : null}
        {subscriptions.length ? <PackageGroup title={t('payment.plans.subscription')} icon={Repeat2} packages={subscriptions} onBuy={(id) => navigate(`/candidate/payment?packageId=${encodeURIComponent(id)}`)} /> : null}
      </div>
    </div>
  );
};

function PackageGroup({ title, icon: Icon, packages, onBuy }: { title: string; icon: typeof Package; packages: PackageResponse[]; onBuy: (id: string) => void }) {
  const { t } = useLanguage();
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2"><Icon className="size-5 text-info" aria-hidden /><h2 className="heading-secondary text-xl text-foreground">{title}</h2></div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((item) => (
          <article key={item.id} className="frame-satin flex flex-col rounded-2xl bg-surface-raised p-6">
            <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
            <p className="mt-4 text-3xl font-semibold text-foreground">{formatVnd(item.priceVnd)}</p>
            <dl className="mt-5 space-y-3 border-t border-satin pt-5 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{t('payment.plans.tokenCount').replace('{count}', '')}</dt><dd className="font-medium text-foreground">{item.interviewCredits == null ? '—' : item.interviewCredits.toLocaleString()}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{t('payment.wallet.accountStatus')}</dt><dd className="font-medium text-success">{item.isActive ? t('payment.wallet.active') : t('payment.wallet.suspended')}</dd></div>
              {item.durationDays != null ? <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{t('payment.wallet.expiresAt')}</dt><dd className="font-medium text-foreground">{item.durationDays} days</dd></div> : null}
            </dl>
            <button type="button" className="btn-primary mt-6 w-full" onClick={() => onBuy(item.id)}>{t('payment.plans.buyPackage')}</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}
