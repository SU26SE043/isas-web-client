import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, LogOut } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import { LanguageToggle } from './LanguageToggle';

function navLinkClassName(isActive: boolean, isCollapsed: boolean) {
  return cn(
    'group relative flex items-center rounded-lg text-sm font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
    isCollapsed ? 'justify-center px-0 py-2.5' : 'justify-center px-0 py-2.5 sm:justify-start sm:gap-3 sm:px-3 sm:text-left',
    isActive
      ? 'bg-surface-elevated text-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-surface-overlay hover:text-foreground',
  );
}

export const EmployerDashboardLayout: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen surface-base">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            'sticky top-0 flex h-screen shrink-0 flex-col border-r border-subtle bg-surface-sunken transition-[width] duration-300 ease-out',
            isCollapsed ? 'w-[4.5rem]' : 'w-[4.5rem] sm:w-64',
          )}
        >
          <div className={cn('flex items-center border-b border-subtle px-3 py-4', isCollapsed ? 'justify-center' : 'justify-center sm:justify-between sm:gap-2')}>
            {!isCollapsed ? (
              <Link to="/" className="focus-ring hidden rounded-md sm:block">
                <BrandLogo className="h-7" />
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setIsCollapsed((value) => !value)}
              aria-label={isCollapsed ? t('employer.campaigns.nav.expand') : t('employer.campaigns.nav.collapse')}
              aria-pressed={isCollapsed}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-surface-overlay hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
            >
              <span aria-hidden>{isCollapsed ? '>' : '<'}</span>
            </button>
          </div>

          <nav className="flex-1 px-3 py-4" aria-label="Employer">
            <NavLink
              to="/employer/campaigns"
              className={({ isActive }) => navLinkClassName(isActive, isCollapsed)}
              aria-label={t('employer.campaigns.nav.campaigns')}
            >
              <BriefcaseBusiness className="h-4 w-4 shrink-0" aria-hidden />
              <span
                className={cn(
                  'overflow-hidden whitespace-nowrap transition-all duration-300',
                  isCollapsed ? 'w-0 opacity-0' : 'w-0 opacity-0 sm:w-auto sm:opacity-100',
                )}
              >
                {t('employer.campaigns.nav.campaigns')}
              </span>
            </NavLink>
          </nav>

          <div className="space-y-3 border-t border-subtle p-3">
            <div className={isCollapsed ? 'flex justify-center' : 'px-0.5'}>
              <LanguageToggle compact={isCollapsed} />
            </div>
            <button type="button" onClick={handleLogout} className={navLinkClassName(false, isCollapsed)}>
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              <span className={cn('overflow-hidden whitespace-nowrap transition-all duration-300', isCollapsed ? 'w-0 opacity-0' : 'w-0 opacity-0 sm:w-auto sm:opacity-100')}>
                {t('employer.campaigns.nav.logout')}
              </span>
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden bg-surface-base">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
