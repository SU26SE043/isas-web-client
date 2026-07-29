import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLanguage } from '@/shared/languages';
import { PackageCard } from '../../components/live/PackageCard';
import { QuerySection } from '../../components/live/QuerySection';
import { useCreateEmployerOrder } from '../../hooks/useEmployerPaymentMutations';
import { useEmployerPackages } from '../../hooks/useEmployerPaymentQueries';
import { PaymentPackageType } from '../../types/employerPayment.types';
import { canManageEmployerPayment } from '../../utils/employerPayment';
import { getEmployerPaymentErrorKey, getSafeBackendMessage } from '../../utils/employerPaymentErrors';

type Filter = 'all' | PaymentPackageType;

export function EmployerPackagesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const canManage = canManageEmployerPayment(user?.role);
  const [filter, setFilter] = useState<Filter>('all');
  const packages = useEmployerPackages();
  const createOrder = useCreateEmployerOrder();
  const submitLock = useRef(false);
  const items = (packages.data ?? []).filter((item) => filter === 'all' || item.type === filter);
  const error =
    createOrder.error instanceof Error && createOrder.error.message === 'CHECKOUT_URL_MISSING'
      ? t('employerBilling.errors.checkoutMissing')
      : createOrder.error
        ? getSafeBackendMessage(createOrder.error) ?? t(getEmployerPaymentErrorKey(createOrder.error, 'create'))
        : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {([
          ['all', 'employerBilling.packages.all'],
          [PaymentPackageType.OneTime, 'employerBilling.packages.oneTime'],
          [PaymentPackageType.Subscription, 'employerBilling.packages.subscription'],
        ] as const).map(([value, label]) => (
          <Button
            key={value}
            variant={filter === value ? 'default' : 'outline'}
            onClick={() => setFilter(value)}
          >
            {t(label)}
          </Button>
        ))}
      </div>
      {!canManage ? (
        <p className="text-sm text-muted-foreground">{t('employerBilling.packages.adminOnly')}</p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">{error}</p>
      ) : null}
      <QuerySection isLoading={packages.isLoading} isError={packages.isError} onRetry={() => void packages.refetch()}>
        {items.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                canManage={canManage}
                isCreating={createOrder.isPending && createOrder.variables?.id === pkg.id}
                onBuy={() => {
                  if (submitLock.current || createOrder.isPending) return;
                  submitLock.current = true;
                  createOrder.mutate(pkg, {
                    onSettled: () => {
                      submitLock.current = false;
                    },
                  });
                }}
              />
            ))}
          </div>
        ) : (
          <p className="frame-satin rounded-2xl bg-surface-raised p-8 text-center text-sm text-muted-foreground">
            {t('employerBilling.packages.empty')}
          </p>
        )}
      </QuerySection>
    </div>
  );
}
