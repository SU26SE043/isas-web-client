import React, { useMemo, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';
import { NotificationBell } from '@/features/engagement/components/NotificationBell';
import { useLanguage } from '../shared/languages';
import { LanguageToggle } from './LanguageToggle';
import { SidebarLogoutButton } from './components/SidebarLogoutButton';
import { buildCandidateDashboardNav } from './candidateDashboardNav';

const navLinkClassName = (isActive: boolean, isCollapsed: boolean) =>
  [
    'group relative flex items-center rounded-xl text-sm font-medium transition-[background-color,color,box-shadow] duration-200 ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
    isCollapsed
      ? 'justify-center px-0 py-2.5'
      : 'justify-center px-0 py-2.5 sm:justify-start sm:gap-3 sm:px-3 sm:text-left',
    isActive
      ? 'bg-surface-elevated text-foreground shadow-sm ring-1 ring-white/8'
      : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
  ].join(' ');

export const DashboardLayout: React.FC = () => {
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = useMemo(() => buildCandidateDashboardNav(t), [t]);

  return (
    <div className="min-h-screen surface-page">
      <div className="flex min-h-screen">
        <aside
          className={[
            'glass-sidebar sticky top-0 flex h-screen shrink-0 flex-col border-r transition-[width] duration-300 ease-out',
            isCollapsed ? 'w-[4.5rem]' : 'w-[4.5rem] sm:w-60',
          ].join(' ')}
        >
          <div
            className={`flex items-center border-b border-subtle px-3 py-4 ${isCollapsed ? 'justify-center' : 'justify-center sm:justify-between sm:gap-2'}`}
          >
            {!isCollapsed ? (
              <Link to="/" className="focus-ring hidden rounded-md sm:block">
                <BrandLogo className="h-7" />
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setIsCollapsed((value) => !value)}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-pressed={isCollapsed}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-surface-overlay hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>

          <nav className="flex-1 px-3 py-4" aria-label="Dashboard">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => navLinkClassName(isActive, isCollapsed)}
                  title={isCollapsed ? item.label : undefined}
                  aria-label={item.label}
                  end={item.end}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">{item.icon}</span>
                  <span
                    className={[
                      'overflow-hidden whitespace-nowrap transition-all duration-300',
                      isCollapsed ? 'w-0 opacity-0' : 'w-0 opacity-0 sm:w-auto sm:opacity-100',
                    ].join(' ')}
                    aria-hidden={isCollapsed}
                  >
                    {item.label}
                  </span>
                  {isCollapsed ? (
                    <span className="pointer-events-none absolute left-full z-50 ml-2 hidden rounded-md border border-subtle bg-surface-elevated px-2 py-1 text-xs font-medium text-foreground opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100 lg:block">
                      {item.label}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="space-y-3 border-t border-subtle p-3">
            <div className={isCollapsed ? 'flex justify-center' : 'flex items-center gap-2 px-0.5'}>
              <NotificationBell scope="candidate" panelPlacement="sidebar" />
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
              title={isCollapsed ? t('profile.logout') : undefined}
              aria-label={t('profile.logout')}
              className={navLinkClassName(false, isCollapsed)}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span
                className={[
                  'overflow-hidden whitespace-nowrap transition-all duration-300',
                  isCollapsed ? 'w-0 opacity-0' : 'w-0 opacity-0 sm:w-auto sm:opacity-100',
                ].join(' ')}
                aria-hidden={isCollapsed}
              >
                {t('profile.logout')}
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
