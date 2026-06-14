import React, { useMemo, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/stores/authStore';
import { useLanguage } from '../shared/languages';

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
  permission?: string;
};

const navLinkClassName = (isActive: boolean, isCollapsed: boolean) =>
  [
    'group relative flex items-center rounded-xl text-sm font-medium transition-all duration-300 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-pine',
    isCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3 text-left',
    isActive
      ? 'bg-[#FACC15] text-gray-900 font-bold shadow-[0_8px_24px_rgba(250,204,21,0.2)]'
      : 'text-white/80 hover:bg-white/10 hover:text-white',
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
        to: '/profile',
        label: t('profile.navProfile'),
        icon: (
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      },
      {
        to: '/practice/history',
        label: t('profile.navInterviewHistory'),
        icon: (
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    ],
    [t],
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="flex min-h-screen">
        <aside
          className={[
            'sticky top-0 flex h-screen shrink-0 flex-col border-r border-white/10 bg-pine text-white shadow-xl transition-[width] duration-300 ease-in-out',
            isCollapsed ? 'w-20' : 'w-64',
          ].join(' ')}
        >
          <div className="flex items-center justify-end gap-3 px-4 pt-4 pb-3">
            <button
              type="button"
              onClick={() => setIsCollapsed((value) => !value)}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-pressed={isCollapsed}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]/70"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>

          <nav className="flex-1 px-4 py-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => navLinkClassName(isActive, isCollapsed)}
                  title={isCollapsed ? item.label : undefined}
                  aria-label={item.label}
                  end={item.end}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">{item.icon}</span>
                  <span
                    className={[
                      'overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out',
                      isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
                    ].join(' ')}
                    aria-hidden={isCollapsed}
                  >
                    {item.label}
                  </span>
                  {isCollapsed ? (
                    <span className="pointer-events-none absolute left-full ml-3 hidden rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100 lg:block">
                      {item.label}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="border-t border-white/10 p-4">
            <button
              type="button"
              onClick={handleLogout}
              title={isCollapsed ? t('profile.logout') : undefined}
              aria-label={t('profile.logout')}
              className={navLinkClassName(false, isCollapsed)}
            >
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span
                className={[
                  'overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out',
                  isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
                ].join(' ')}
                aria-hidden={isCollapsed}
              >
                {t('profile.logout')}
              </span>
              {isCollapsed ? (
                <span className="pointer-events-none absolute left-full ml-3 hidden rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100 lg:block">
                  {t('profile.logout')}
                </span>
              ) : null}
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden transition-all duration-300 ease-in-out">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
