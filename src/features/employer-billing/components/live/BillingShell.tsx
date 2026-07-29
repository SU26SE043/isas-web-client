import { CreditCard, PackagePlus } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
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
] as const;

export function BillingShell() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const canManage = canManageEmployerPayment(user?.role);

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-surface-overlay frame-satin-soft">
              <CreditCard className="size-5" aria-hidden />
            </div>
            <h1 className="heading-primary text-3xl text-foreground">{t('employerBilling.live.title')}</h1>
            <p className="body-text mt-2 max-w-2xl text-muted-foreground">
              {t('employerBilling.live.description')}
            </p>
          </div>
          {canManage ? (
            <Button
              render={<Link to="/employer/billing/packages" />}
              nativeButton={false}
              size="lg"
            >
              <PackagePlus aria-hidden />
              {t('employerBilling.live.buyCredits')}
            </Button>
          ) : null}
        </header>

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
