import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { TokenUsageHistoryTable } from '../components/TokenUsageHistoryTable';
import { useTokenUsage } from '../hooks/useTokenWallet';

export const TokenUsagePage: React.FC = () => {
  const { t } = useLanguage();
  const { usage, isLoading } = useTokenUsage();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="heading-primary text-3xl text-foreground">{t('payment.usage.title')}</h1>
            <p className="body-text mt-2 text-sm text-muted-foreground">{t('payment.usage.subtitle')}</p>
          </div>
          <Link to="/candidate/credits" className="btn-secondary">
            {t('payment.usage.backToWallet')}
          </Link>
        </header>

        <TokenUsageHistoryTable records={usage} />
      </div>
    </div>
  );
};
