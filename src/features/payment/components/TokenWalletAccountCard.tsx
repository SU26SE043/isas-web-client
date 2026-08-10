import { Coins } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { PaymentAccountResponse, WalletSnapshot } from '../types/payment.types';

export function TokenWalletAccountCard({ wallet, account }: { wallet: WalletSnapshot; account?: PaymentAccountResponse }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  return (
    <section className="frame-satin rounded-2xl bg-surface-raised p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-label">{t('payment.wallet.balanceLabel')}</p>
          <p className="heading-primary mt-2 text-5xl font-semibold tracking-tight text-foreground">
            {wallet.balance.toLocaleString(locale)}
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-xl bg-surface-overlay frame-satin-soft">
          <Coins className="size-5" aria-hidden />
        </div>
      </div>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-info/30 bg-info-bg px-3 py-1 text-xs font-medium text-info">
        {t('payment.wallet.title')}
      </div>

      <dl className="mt-5 grid gap-4 border-t border-satin pt-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">{t('payment.wallet.reservedLabel')}</dt>
          <dd className="mt-1 font-medium text-foreground">{wallet.reserved.toLocaleString(locale)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t('payment.wallet.availableLabel')}</dt>
          <dd className="mt-1 font-medium text-foreground">{wallet.available.toLocaleString(locale)}</dd>
        </div>
      </dl>

      {account ? (
        <dl className="mt-5 grid gap-4 border-t border-satin pt-5 sm:grid-cols-2">
          <Detail label={t('payment.wallet.ownerId')} value={account.ownerId} />
          <Detail label={t('payment.wallet.ownerType')} value={account.ownerType === 1 ? t('payment.wallet.userOwner') : t('payment.wallet.organizationOwner')} />
          <Detail label={t('payment.wallet.paymentMode')} value={account.paymentMode === 0 ? t('payment.wallet.prepaid') : t('payment.wallet.postpaid')} />
          <Detail label={t('payment.wallet.accountStatus')} value={account.status === 0 ? t('payment.wallet.active') : t('payment.wallet.suspended')} />
          <Detail label={t('payment.wallet.creditLimit')} value={account.creditLimit == null ? '—' : account.creditLimit.toLocaleString(locale)} />
          <Detail label={t('payment.wallet.periodUsage')} value={account.periodUsage == null ? '—' : account.periodUsage.toLocaleString(locale)} />
          <Detail label={t('payment.wallet.updatedAt')} value={formatDate(account.updatedAt, locale)} />
        </dl>
      ) : null}

    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate font-medium text-foreground" title={value}>{value}</dd>
    </div>
  );
}

function formatDate(value: string, locale: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
