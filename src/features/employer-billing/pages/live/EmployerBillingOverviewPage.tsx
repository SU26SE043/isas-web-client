import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLanguage } from '@/shared/languages';
import { AccountCard } from '../../components/live/AccountCard';
import { OrdersTable } from '../../components/live/OrdersTable';
import { QuerySection } from '../../components/live/QuerySection';
import { SubscriptionCard } from '../../components/live/SubscriptionCard';
import { TransactionsTable } from '../../components/live/TransactionsTable';
import {
  useEmployerOrders,
  useEmployerPackages,
  useEmployerPaymentAccount,
  useEmployerSubscription,
  useEmployerTransactions,
} from '../../hooks/useEmployerPaymentQueries';
import { canManageEmployerPayment } from '../../utils/employerPayment';

export function EmployerBillingOverviewPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const canManage = canManageEmployerPayment(user?.role);
  const account = useEmployerPaymentAccount();
  const subscription = useEmployerSubscription();
  const packages = useEmployerPackages();
  const orders = useEmployerOrders(null, 5);
  const transactions = useEmployerTransactions(null, 5);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <QuerySection isLoading={account.isLoading} isError={account.isError} onRetry={() => void account.refetch()}>
          {account.data ? <AccountCard account={account.data} /> : null}
        </QuerySection>
        <QuerySection isLoading={subscription.isLoading} isError={subscription.isError} onRetry={() => void subscription.refetch()}>
          {subscription.data ? <SubscriptionCard subscription={subscription.data} canManage={canManage} /> : null}
        </QuerySection>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="heading-secondary text-xl text-foreground">{t('employerBilling.live.recentOrders')}</h2>
          <Button variant="ghost" render={<Link to="/employer/billing/orders" />} nativeButton={false}>
            {t('employerBilling.live.viewAll')}
          </Button>
        </div>
        <QuerySection isLoading={orders.isLoading} isError={orders.isError} onRetry={() => void orders.refetch()}>
          <OrdersTable orders={orders.data?.data ?? []} packages={packages.data} canManage={false} />
        </QuerySection>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="heading-secondary text-xl text-foreground">{t('employerBilling.live.recentTransactions')}</h2>
          <Button variant="ghost" render={<Link to="/employer/billing/transactions" />} nativeButton={false}>
            {t('employerBilling.live.viewAll')}
          </Button>
        </div>
        <QuerySection
          isLoading={transactions.isLoading}
          isError={transactions.isError}
          onRetry={() => void transactions.refetch()}
          errorTitle={t('employerBilling.transactions.errorTitle')}
          errorDescription={t('employerBilling.transactions.errorDescription')}
        >
          <TransactionsTable transactions={transactions.data?.items ?? []} />
        </QuerySection>
      </section>
    </div>
  );
}
