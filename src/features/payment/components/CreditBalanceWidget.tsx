import { useLanguage } from '@/shared/languages';

interface CreditBalanceWidgetProps {
  balance: number;
  reserved?: number;
  available?: number;
}

export function CreditBalanceWidget({ balance, reserved = 0, available }: CreditBalanceWidgetProps) {
  const { t } = useLanguage();
  const availableBalance = available ?? balance - reserved;

  return (
    <section className="rounded-xl border border-subtle bg-surface-raised p-6">
      <p className="text-label text-muted-foreground">{t('payment.wallet.balanceLabel')}</p>
      <p className="heading-primary mt-2 text-5xl text-foreground">{balance.toLocaleString()}</p>
      <p className="body-text mt-2 text-sm text-muted-foreground">{t('payment.wallet.balanceHint')}</p>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-subtle bg-surface-base px-4 py-3">
          <dt className="text-xs text-muted-foreground">{t('payment.wallet.reservedLabel')}</dt>
          <dd className="mt-1 text-lg font-semibold text-foreground">{reserved.toLocaleString()}</dd>
        </div>
        <div className="rounded-lg border border-subtle bg-surface-base px-4 py-3">
          <dt className="text-xs text-muted-foreground">{t('payment.wallet.availableLabel')}</dt>
          <dd className="mt-1 text-lg font-semibold text-foreground">{availableBalance.toLocaleString()}</dd>
        </div>
      </dl>
    </section>
  );
}
