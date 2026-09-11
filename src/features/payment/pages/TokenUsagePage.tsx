import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { PaymentQuerySection } from '../components/PaymentQuerySection';
import { TokenUsageHistoryTable } from '../components/TokenUsageHistoryTable';
import { useTokenUsage } from '../hooks/useTokenWallet';
import { PageHeader } from '@/components/patterns/PageHeader';

export const TokenUsagePage: React.FC = () => {
  const { t } = useLanguage();
  const usageQuery = useTokenUsage();

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="app-page space-y-6">
        <PageHeader title={t('payment.usage.title')} description={t('payment.usage.subtitle')} />

        <nav className="flex gap-1 overflow-x-auto border-b border-satin" aria-label={t('payment.usage.title')}>
          <Link to="/candidate/credits" className="shrink-0 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
            {t('payment.wallet.title')}
          </Link>
          <Link to="/candidate/usage" className="shrink-0 border-b-2 border-foreground px-4 py-3 text-sm font-medium text-foreground">
            {t('payment.wallet.viewUsage')}
          </Link>
        </nav>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="heading-secondary text-xl text-foreground">{t('payment.usage.title')}</p>
            <Link to="/candidate/credits" className="btn-ghost text-sm">
              {t('payment.usage.backToWallet')}
            </Link>
          </div>
          <PaymentQuerySection
            isLoading={usageQuery.isLoading}
            isError={usageQuery.isError}
            onRetry={() => void usageQuery.reload()}
          >
            <TokenUsageHistoryTable records={usageQuery.usage} />
          </PaymentQuerySection>
        </section>
      </div>
    </div>
  );
};
