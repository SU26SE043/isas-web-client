import React, { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuthStore } from '../features/auth/stores/authStore';
import { useLanguage } from '../shared/languages';
import { LanguageToggle } from './LanguageToggle';

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
};

const navLinkClassName = (isActive: boolean, isCollapsed: boolean) =>
  [
    'group relative flex items-center rounded-lg text-sm font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
    isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5 text-left',
    isActive
      ? 'bg-surface-elevated text-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-surface-overlay hover:text-foreground',
  ].join(' ');

export const DashboardLayout: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = useMemo<NavItem[]>(
    () => [
      {
        to: '/candidate/dashboard',
        label: t('profile.navDashboard'),
        end: true,
        icon: (
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
      {
        to: '/candidate/profile',
        label: t('profile.navProfile'),
        icon: (
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      },
      {
        to: '/candidate/cv/upload',
        label: t('profile.navCvUpload'),
        icon: (
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        ),
      },
      {
        to: '/candidate/cv/analysis',
        label: t('profile.navCvAnalysis'),
        icon: (
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        to: '/candidate/practice/history',
        label: t('profile.navInterviewHistory'),
        icon: (
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    ],
    [t],
  );

  return (
    <div className="min-h-screen surface-base">
      <div className="flex min-h-screen">
        <aside
          className={[
            'sticky top-0 flex h-screen shrink-0 flex-col border-r border-subtle bg-surface-sunken transition-[width] duration-300 ease-out',
            isCollapsed ? 'w-[4.5rem]' : 'w-60',
          ].join(' ')}
        >
          <div className={`flex items-center border-b border-subtle px-3 py-4 ${isCollapsed ? 'justify-center' : 'justify-between gap-2'}`}>
            {!isCollapsed ? (
              <Link to="/" className="focus-ring rounded-md">
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
                      isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
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

          <div className="border-t border-subtle p-3 space-y-3">
            <div className={isCollapsed ? 'flex justify-center' : 'px-0.5'}>
              <LanguageToggle compact={isCollapsed} />
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title={isCollapsed ? t('profile.logout') : undefined}
              aria-label={t('profile.logout')}
              className={navLinkClassName(false, isCollapsed)}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span
                className={[
                  'overflow-hidden whitespace-nowrap transition-all duration-300',
                  isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
                ].join(' ')}
                aria-hidden={isCollapsed}
              >
                {t('profile.logout')}
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
