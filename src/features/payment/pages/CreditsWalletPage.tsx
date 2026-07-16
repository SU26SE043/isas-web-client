import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { CreditBalanceWidget } from '../components/CreditBalanceWidget';
import { PaymentOrdersTable } from '../components/PaymentOrdersTable';
import { TransactionHistoryTable } from '../components/TransactionHistoryTable';
import {
  useCancelPaymentOrder,
  useMyPaymentOrders,
  usePaymentOrderStatus,
} from '../hooks/useMyPaymentOrders';
import { useTokenWallet } from '../hooks/useTokenWallet';
import { PRACTICE_RESERVE_ESTIMATE } from '../constants';

export const CreditsWalletPage: React.FC = () => {
  const { t } = useLanguage();
  const { wallet, balance, reserved, available, isLoading } = useTokenWallet();
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);
  const ordersQuery = useMyPaymentOrders();
  const statusQuery = usePaymentOrderStatus(selectedOrderId);
  const cancelOrder = useCancelPaymentOrder();

  React.useEffect(() => {
    if (!selectedOrderId && ordersQuery.data?.[0]) {
      setSelectedOrderId(ordersQuery.data[0].orderId);
    }
  }, [ordersQuery.data, selectedOrderId]);

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

        <CreditBalanceWidget balance={balance} reserved={reserved} available={available} />

        {available < PRACTICE_RESERVE_ESTIMATE ? (
          <p className="rounded-xl border border-subtle bg-surface-raised px-4 py-3 text-sm text-muted-foreground">
            {t('payment.wallet.insufficientReserve').replace('{amount}', PRACTICE_RESERVE_ESTIMATE.toLocaleString())}
          </p>
        ) : null}

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="heading-secondary text-xl text-foreground">{t('payment.orders.title')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('payment.orders.subtitle')}</p>
            </div>
          </div>
          {ordersQuery.isLoading ? (
            <p className="rounded-xl border border-subtle bg-surface-raised px-4 py-8 text-center text-sm text-muted-foreground">
              {t('payment.orders.loading')}
            </p>
          ) : ordersQuery.error ? (
            <p className="rounded-xl border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">
              {t('payment.orders.loadError')}
            </p>
          ) : (
            <PaymentOrdersTable
              orders={ordersQuery.data ?? []}
              selectedOrderId={selectedOrderId}
              statusResult={statusQuery.data}
              isStatusLoading={statusQuery.isFetching}
              isCanceling={cancelOrder.isPending}
              cancelError={cancelOrder.error ? t('payment.orders.cancelError') : null}
              onSelectOrder={(orderId) => {
                cancelOrder.reset();
                setSelectedOrderId(orderId);
              }}
              onRefreshStatus={() => void statusQuery.refetch()}
              onCancelOrder={(orderId) => cancelOrder.mutate(orderId)}
            />
          )}
        </section>

        <section className="space-y-3">
          <h2 className="heading-secondary text-xl text-foreground">{t('payment.transactions.title')}</h2>
          <TransactionHistoryTable transactions={wallet?.transactions ?? []} />
        </section>
      </div>
    </div>
  );
};
