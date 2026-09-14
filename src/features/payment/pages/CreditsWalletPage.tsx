import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { PaymentQuerySection } from '../components/PaymentQuerySection';
import { TokenTransactionsTable } from '../components/TokenTransactionsTable';
import { TokenWalletAccountCard } from '../components/TokenWalletAccountCard';
import { TokenSubscriptionCard } from '../components/TokenSubscriptionCard';
import { usePaymentAccount, usePaymentSubscription, useTokenWallet } from '../hooks/useTokenWallet';
import { useCreditTransactions } from '../hooks/useCreditTransactions';
import { useCancelPaymentOrder, useMyPaymentOrders } from '../hooks/useMyPaymentOrders';
import { PaymentOrdersTable } from '../components/PaymentOrdersTable';
import { TokenPackageCatalog } from '../components/TokenPackageCatalog';
import { PageHeader } from '@/components/patterns/PageHeader';

export const CreditsWalletPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const walletQuery = useTokenWallet();
  const accountQuery = usePaymentAccount();
  const subscriptionQuery = usePaymentSubscription();
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'transactions' | 'orders'>('overview');
  const [ordersPage, setOrdersPage] = useState(0);
  const [ordersPageSize, setOrdersPageSize] = useState(5);
  const transactionQuery = useCreditTransactions(25, activeTab === 'transactions');
  const ordersQuery = useMyPaymentOrders(activeTab === 'orders');
  const cancelOrder = useCancelPaymentOrder();
  const tabs = [
    ['overview', t('payment.wallet.overview')],
    ['packages', t('payment.wallet.packages')],
    ['transactions', t('payment.wallet.creditMovements')],
    ['orders', t('payment.wallet.orders')],
  ] as const;

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="app-page space-y-6">
        <PageHeader
          title={t('payment.wallet.title')}
          description={t('payment.wallet.subtitle')}
          actions={
            <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={() => setActiveTab('packages')}>
              <PackagePlus className="size-4" aria-hidden />
              {t('payment.wallet.buyTokens')}
            </button>
          }
        />

        <nav className="flex gap-1 overflow-x-auto border-b border-satin" aria-label={t('payment.wallet.title')}>
          {tabs.map(([id, label]) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={activeTab === id ? 'shrink-0 border-b-2 border-foreground px-4 py-3 text-sm font-medium text-foreground' : 'shrink-0 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground'}>{label}</button>)}
        </nav>

        {activeTab === 'overview' && <div className="grid gap-6 lg:grid-cols-2">
          <PaymentQuerySection
            isLoading={accountQuery.isLoading || walletQuery.isLoading}
            isError={accountQuery.isError || walletQuery.isError || !accountQuery.data || !walletQuery.wallet}
            onRetry={() => {
              void accountQuery.refetch();
              void walletQuery.reload();
            }}
          >
            {accountQuery.data && walletQuery.wallet ? <TokenWalletAccountCard wallet={walletQuery.wallet} account={accountQuery.data} /> : null}
          </PaymentQuerySection>
          <PaymentQuerySection
            isLoading={subscriptionQuery.isLoading}
            isError={subscriptionQuery.isError || !subscriptionQuery.data}
            onRetry={() => void subscriptionQuery.refetch()}
          >
            {subscriptionQuery.data ? <TokenSubscriptionCard subscription={subscriptionQuery.data} onBrowsePackages={() => setActiveTab('packages')} /> : null}
          </PaymentQuerySection>
        </div>}

        {activeTab === 'packages' && <TokenPackageCatalog />}

        {activeTab === 'transactions' && <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="heading-secondary text-xl text-foreground">{t('payment.transactions.title')}</h2>
          </div>
          <PaymentQuerySection isLoading={transactionQuery.isLoading} isError={transactionQuery.isError || !transactionQuery.data} errorMessage={t('payment.transactions.loadError')} onRetry={() => void transactionQuery.refetch()}>
            {transactionQuery.data ? <><TokenTransactionsTable transactions={transactionQuery.data} />{transactionQuery.hasNextPage ? <button type="button" className="btn-secondary" onClick={() => void transactionQuery.fetchNextPage()} disabled={transactionQuery.isFetchingNextPage}>{t('payment.orders.loadMore')}</button> : null}</> : null}
          </PaymentQuerySection>
        </section>
        }
        {activeTab === 'orders' && <section className="space-y-4">
          <h2 className="heading-secondary text-xl text-foreground">{t('payment.orders.title')}</h2>
          <PaymentQuerySection isLoading={ordersQuery.isLoading} isError={ordersQuery.isError || !ordersQuery.data} errorMessage={t('payment.orders.loadError')} onRetry={() => void ordersQuery.refetch()}>
            {ordersQuery.data ? <PaymentOrdersTable orders={ordersQuery.data.orders.slice(ordersPage * ordersPageSize, (ordersPage + 1) * ordersPageSize)} statuses={ordersQuery.data.statuses} cancellingId={cancelOrder.isPending ? cancelOrder.variables : undefined} onCancel={(id) => cancelOrder.mutate(id)} onView={(order) => navigate(`/candidate/orders/${encodeURIComponent(order.orderId)}`)} page={ordersPage} pageSize={ordersPageSize} totalLoaded={ordersQuery.data.orders.length} hasNextPage={Boolean(ordersQuery.hasNextPage)} isFetchingNextPage={ordersQuery.isFetchingNextPage} onPageSizeChange={(size) => { setOrdersPageSize(size); setOrdersPage(0); }} onPreviousPage={() => setOrdersPage((current) => Math.max(0, current - 1))} onNextPage={() => { const nextStart = (ordersPage + 1) * ordersPageSize; if (nextStart >= ordersQuery.data!.orders.length && ordersQuery.hasNextPage) { void ordersQuery.fetchNextPage().then(() => setOrdersPage((current) => current + 1)); } else { setOrdersPage((current) => current + 1); } }} /> : null}
          </PaymentQuerySection>
        </section>}
      </div>
    </div>
  );
};
