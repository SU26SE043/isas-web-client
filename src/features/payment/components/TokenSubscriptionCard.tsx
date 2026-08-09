import { CalendarClock, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { SubscriptionResponse } from '../types/payment.types';

export function TokenSubscriptionCard({ subscription, onBrowsePackages }: { subscription: SubscriptionResponse; onBrowsePackages?: () => void }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const formatDate = (value: string | null) =>
    value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value)) : '—';

  return (
    <section className="frame-satin rounded-2xl bg-surface-raised p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-label">{t('payment.wallet.subscriptionTitle')}</p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            {subscription.active ? t('payment.wallet.subscriptionActive') : t('payment.wallet.subscriptionInactive')}
          </p>
        </div>
        <span className={subscription.active ? 'inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-bg px-3 py-1 text-xs font-medium text-success' : 'inline-flex items-center gap-1.5 rounded-full border border-subtle bg-surface-overlay px-3 py-1 text-xs font-medium text-muted-foreground'}>
          <CheckCircle2 className="size-3.5" aria-hidden />
          {subscription.active ? t('payment.wallet.active') : t('payment.wallet.subscriptionInactive')}
        </span>
      </div>
      <dl className="mt-5 grid gap-4 border-t border-satin pt-5 sm:grid-cols-3">
        <div><dt className="text-xs text-muted-foreground">{t('payment.wallet.billingCycle')}</dt><dd className="mt-1 font-medium text-foreground">{subscription.billingCycle ?? '—'}</dd></div>
        <div><dt className="text-xs text-muted-foreground">{t('payment.wallet.startedAt')}</dt><dd className="mt-1 font-medium text-foreground">{formatDate(subscription.startedAt)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">{t('payment.wallet.expiresAt')}</dt><dd className="mt-1 font-medium text-foreground">{formatDate(subscription.expiresAt)}</dd></div>
      </dl>
      {!subscription.active ? (
        <button type="button" onClick={onBrowsePackages} className="btn-secondary mt-5 inline-flex items-center gap-2">
          <CalendarClock className="size-4" aria-hidden />
          {t('payment.wallet.buyTokens')}
        </button>
      ) : null}
    </section>
  );
}
