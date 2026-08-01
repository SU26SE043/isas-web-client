import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTokenWallet } from '../hooks/useTokenWallet';
import { PRACTICE_RESERVE_ESTIMATE } from '../constants';

export const CreditsWalletPage: React.FC = () => {
  const { t } = useLanguage();
  const { wallet, balance, reserved, available, isLoading, isError, reload } = useTokenWallet();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (isError || !wallet || balance == null || reserved == null || available == null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-muted-foreground">{t('payment.result.loadError')}</p>
        <button type="button" className="btn-secondary" onClick={() => void reload()}>
          {t('payment.result.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="heading-primary text-3xl text-foreground">{t('payment.wallet.title')}</h1>
            <p className="body-text mt-2 text-sm text-muted-foreground">{t('payment.wallet.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/candidate/usage" className="btn-secondary">
              {t('payment.wallet.viewUsage')}
            </Link>
            <Link to="/candidate/subscription" className="btn-primary">
              {t('payment.wallet.buyTokens')}
            </Link>
          </div>
        </header>

        <section className="rounded-xl border border-subtle bg-surface-raised p-6">
          <p className="text-sm text-muted-foreground">{t('payment.wallet.balanceLabel')}</p>
          <p className="heading-primary mt-2 text-5xl text-foreground">
            {balance.toLocaleString()}
          </p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-subtle bg-surface-base p-4">
              <dt className="text-sm text-muted-foreground">{t('payment.wallet.reservedLabel')}</dt>
              <dd className="mt-1 text-xl font-semibold text-foreground">
                {reserved.toLocaleString()}
              </dd>
            </div>
            <div className="rounded-lg border border-subtle bg-surface-base p-4">
              <dt className="text-sm text-muted-foreground">{t('payment.wallet.availableLabel')}</dt>
              <dd className="mt-1 text-xl font-semibold text-foreground">
                {available.toLocaleString()}
              </dd>
            </div>
          </dl>
        </section>

        {available < PRACTICE_RESERVE_ESTIMATE ? (
          <p className="rounded-xl border border-subtle bg-surface-raised px-4 py-3 text-sm text-muted-foreground">
            {t('payment.wallet.insufficientReserve').replace(
              '{amount}',
              PRACTICE_RESERVE_ESTIMATE.toLocaleString(),
            )}
          </p>
        ) : null}

        <section className="space-y-3">
          <h2 className="heading-secondary text-xl text-foreground">{t('payment.transactions.title')}</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('payment.transactions.date')}</TableHead>
                <TableHead>{t('payment.transactions.description')}</TableHead>
                <TableHead className="text-right">{t('payment.transactions.tokens')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallet.transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {t(`payment.transactions.${transaction.type}`)}
                  </TableCell>
                  <TableCell className="text-right">{transaction.tokensDelta.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {wallet.transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    {t('payment.transactions.empty')}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </section>
      </div>
    </div>
  );
};
