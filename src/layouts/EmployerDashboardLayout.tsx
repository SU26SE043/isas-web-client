import React, { useMemo, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import { buildEmployerNavItems, filterEmployerNavItems } from './employerNavItems';
import { NotificationBell } from '@/features/engagement/components/NotificationBell';
import { LanguageToggle } from './LanguageToggle';
import { SidebarLogoutButton } from './components/SidebarLogoutButton';

function navLinkClassName(isActive: boolean, isCollapsed: boolean) {
  return cn(
    'group relative flex items-center rounded-xl text-sm font-medium transition-[background-color,color,box-shadow] duration-200 ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
    isCollapsed
      ? 'justify-center px-0 py-2.5'
      : 'justify-center px-0 py-2.5 sm:justify-start sm:gap-3 sm:px-3 sm:text-left',
    isActive
      ? 'bg-surface-elevated text-foreground shadow-sm ring-1 ring-white/8'
      : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
  );
}

export const EmployerDashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const role = user?.role ?? null;
  // Role must come from auth store; never invent a default org/candidate role for nav.
  const navItems = useMemo(
    () => (role ? filterEmployerNavItems(buildEmployerNavItems(t), role) : []),
    [role, t],
  );

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen surface-page">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            'glass-sidebar sticky top-0 flex h-screen shrink-0 flex-col border-r transition-[width] duration-300 ease-out',
            isCollapsed ? 'w-[4.5rem]' : 'w-[4.5rem] sm:w-64',
          )}
        >
          <div
            className={cn(
              'flex items-center border-b border-subtle px-3 py-4',
              isCollapsed ? 'justify-center' : 'justify-center sm:justify-between sm:gap-2',
            )}
          >
            {!isCollapsed && (
              <Link to="/" className="focus-ring hidden rounded-md sm:block">
                <BrandLogo className="h-7" />
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsCollapsed((value) => !value)}
              aria-label={isCollapsed ? t('employer.nav.collapsed.expand') : t('employer.nav.collapsed.collapse')}
              aria-pressed={isCollapsed}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-surface-overlay hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
            >
              <span aria-hidden>{isCollapsed ? '>' : '<'}</span>
            </button>
          </div>

          <nav className="flex-1 px-3 py-4" aria-label="Employer">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={isCollapsed ? item.label : undefined}
                  aria-label={item.label}
                  className={({ isActive }) => navLinkClassName(isActive, isCollapsed)}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">{item.icon}</span>
                  <span
                    className={cn(
                      'overflow-hidden whitespace-nowrap transition-all duration-300',
                      isCollapsed ? 'w-0 opacity-0' : 'w-0 opacity-0 sm:w-auto sm:opacity-100',
                    )}
                    aria-hidden={isCollapsed}
                  >
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="space-y-3 border-t border-subtle p-3">
            <div className={isCollapsed ? 'flex justify-center' : 'flex items-center gap-2 px-0.5'}>
              <NotificationBell scope="employer" panelPlacement="sidebar" />
              {!isCollapsed ? (
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  {t('engagement.nav.notifications')}
                </span>
              ) : null}
            </div>
            <div className={isCollapsed ? 'flex justify-center' : 'px-0.5'}>
              <LanguageToggle compact />
            </div>

            <SidebarLogoutButton
              className={navLinkClassName(false, isCollapsed)}
              aria-label={t('employer.nav.logout')}
              title={isCollapsed ? t('employer.nav.logout') : undefined}
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              <span
                className={cn(
                  'overflow-hidden whitespace-nowrap transition-all duration-300',
                  isCollapsed ? 'w-0 opacity-0' : 'w-0 opacity-0 sm:w-auto sm:opacity-100',
                )}
              >
                {t('employer.nav.logout')}
              </span>
            </SidebarLogoutButton>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden bg-surface-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
