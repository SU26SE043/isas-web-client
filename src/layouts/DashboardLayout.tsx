import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/stores/authStore';
import { useLanguage } from '../shared/languages';

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm bg-milk text-pine font-bold shadow-sm'
    : 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-[#F1F5F9]">
      <aside className="w-64 bg-pine text-white flex flex-col h-screen sticky top-0 shrink-0">
        <div className="px-6 pt-4 pb-3">
          {user && (
            <p className="text-[10px] font-bold text-white/60 tracking-wider uppercase mt-1">
              {user.role}
            </p>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
          <NavLink to="/profile" className={navLinkClassName}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {t('profile.navProfile')}
          </NavLink>

          <NavLink to="/practice/history" className={navLinkClassName}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('profile.navInterviewHistory')}
          </NavLink>
        </nav>

        <div className="px-4 py-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-left"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('profile.logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};
