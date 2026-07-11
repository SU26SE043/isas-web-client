import { useLanguage } from '@/shared/languages';

interface CreditBalanceWidgetProps {
  balance: number;
}

export function CreditBalanceWidget({ balance }: CreditBalanceWidgetProps) {
  const { t } = useLanguage();

  return (
    <section className="rounded-xl border border-subtle bg-surface-raised p-6">
      <p className="text-label text-muted-foreground">{t('payment.wallet.balanceLabel')}</p>
      <p className="heading-primary mt-2 text-5xl text-foreground">{balance}</p>
      <p className="body-text mt-2 text-sm text-muted-foreground">{t('payment.wallet.balanceHint')}</p>
    </section>
  );
}
