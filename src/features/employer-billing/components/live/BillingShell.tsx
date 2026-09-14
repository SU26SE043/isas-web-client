import { PackagePlus } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { PageHeader } from '@/components/patterns/PageHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLanguage } from '@/shared/languages';
import { canManageEmployerPayment } from '../../utils/employerPayment';

const tabs = [
  ['', 'employerBilling.live.overview'],
  ['packages', 'employerBilling.live.packages'],
  ['orders', 'employerBilling.live.orders'],
  ['transactions', 'employerBilling.live.transactions'],
  ['invoices', 'employerBilling.live.invoices'],
] as const;

export function BillingShell() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const canManage = canManageEmployerPayment(user?.role);

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="app-page space-y-6">
        <PageHeader
          title={t('employerBilling.live.title')}
          description={t('employerBilling.live.description')}
          actions={
            canManage ? (
              <Button render={<Link to="/employer/billing/packages" />} nativeButton={false} size="lg">
                <PackagePlus aria-hidden />
                {t('employerBilling.live.buyCredits')}
              </Button>
            ) : null
          }
        />

        {!canManage ? (
          <p className="rounded-xl border border-info/30 bg-info-bg px-4 py-3 text-sm text-info">
            {t('employerBilling.live.readOnly')}
          </p>
        ) : null}

        <nav className="flex gap-1 overflow-x-auto border-b border-satin" aria-label={t('employerBilling.live.title')}>
          {tabs.map(([path, label]) => (
            <NavLink
              key={path}
              to={path ? `/employer/billing/${path}` : '/employer/billing'}
              end={!path}
              className={({ isActive }) =>
                cn(
                  'shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )
              }
            >
              {t(label)}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </div>
    </div>
  );
}
