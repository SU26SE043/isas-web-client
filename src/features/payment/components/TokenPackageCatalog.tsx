import { Check, Loader2, Package, Repeat2, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/shared/languages';
import { paymentService } from '../services/payment.service';
import { paymentKeys } from '../hooks/useMyPaymentOrders';
import { usePurchasePackage } from '../hooks/usePurchasePackage';
import type { PackageResponse } from '../types/payment.types';

export function TokenPackageCatalog() {
  const { t } = useLanguage();
  const query = useQuery({ queryKey: paymentKeys.packages(), queryFn: paymentService.listCatalogPackages, retry: false });
  const purchase = usePurchasePackage();
  const packages = query.data ?? [];
  const oneTime = packages.filter((item) => Number(item.type) === 1);
  const subscriptions = packages.filter((item) => Number(item.type) === 2);

  if (query.isLoading) return <div className="flex min-h-48 items-center justify-center"><Loader2 className="size-7 animate-spin text-muted-foreground" aria-hidden /></div>;
  if (query.isError) return <div className="frame-satin rounded-2xl bg-surface-raised p-8 text-center"><p className="text-sm text-error">{t('payment.plans.loadError')}</p><button type="button" className="btn-secondary mt-4" onClick={() => void query.refetch()}>{t('payment.result.retry')}</button></div>;
  if (!packages.length) return <div className="frame-satin rounded-2xl bg-surface-raised p-8 text-center"><p className="font-medium text-foreground">{t('payment.plans.empty')}</p></div>;

  return <div className="space-y-8">
    <PackageGroup title={t('payment.plans.oneTime')} icon={Package} packages={oneTime} purchase={purchase} />
    <PackageGroup title={t('payment.plans.subscription')} icon={Repeat2} packages={subscriptions} purchase={purchase} />
    {purchase.error ? <p role="alert" className="rounded-xl border border-error/30 bg-error-bg p-4 text-sm text-error">{purchase.error}</p> : null}
  </div>;
}

function PackageGroup({ title, icon: Icon, packages, purchase }: { title: string; icon: typeof Package; packages: PackageResponse[]; purchase: ReturnType<typeof usePurchasePackage> }) {
  const { t } = useLanguage();
  if (!packages.length) return null;
  return <section className="space-y-4"><div className="flex items-center gap-2"><Icon className="size-5 text-info" aria-hidden /><h2 className="heading-secondary text-xl text-foreground">{title}</h2></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{packages.map((item) => {
      const isSubscription = Number(item.type) === 2;
      const isBusy = purchase.activePackageId === item.id;
      return <article key={item.id} className="frame-satin flex min-h-64 flex-col rounded-2xl bg-surface-raised p-5 transition-colors hover:bg-surface-overlay">
        <div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold text-foreground">{item.name}</h3><span className={item.isActive ? 'rounded-full border border-success/30 bg-success-bg px-2 py-1 text-xs text-success' : 'rounded-full border border-subtle bg-surface-overlay px-2 py-1 text-xs text-muted-foreground'}>{item.isActive ? t('payment.wallet.active') : t('payment.wallet.suspended')}</span></div>
        <p className="mt-4 text-3xl font-semibold text-foreground">{formatVnd(item.priceVnd)}</p>
        <div className="mt-4 flex-1 space-y-2 border-t border-satin pt-4 text-sm"><p className="flex items-center gap-2 text-muted-foreground"><Check className="size-4 text-success" aria-hidden />{isSubscription ? t('payment.plans.subscription') : t('payment.plans.oneTime')}</p>{item.interviewCredits != null ? <p className="text-foreground">{t('payment.plans.tokenCount').replace('{count}', item.interviewCredits.toLocaleString())}</p> : null}{item.durationDays != null ? <p className="text-muted-foreground">{t('payment.plans.duration').replace('{days}', String(item.durationDays))}</p> : null}</div>
        <button type="button" className="btn-primary mt-5 inline-flex w-full items-center justify-center gap-2" disabled={!item.isActive || purchase.isPurchasing} onClick={() => void purchase.purchasePackage(item.id)}><ShoppingCart className="size-4" aria-hidden />{isBusy ? t('payment.plans.redirecting') : isSubscription ? t('payment.plans.subscribe') : t('payment.plans.buyPackage')}</button>
      </article>;
    })}</div>
  </section>;
}

function formatVnd(value: number) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value); }
