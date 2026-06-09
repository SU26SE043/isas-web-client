import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/stores/authStore';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-[#F1F5F9]">
      {/* Sidebar */}
      <aside className="w-64 bg-pine text-white flex flex-col h-screen sticky top-0 shrink-0">
        {/* Logo */}
        <div className="p-6">
          <h1 className="text-2xl font-black text-milk flex items-center">
            Recruit<span className="text-white">AI</span>
          </h1>
          {user && (
            <p className="text-[10px] font-bold text-white/60 tracking-wider uppercase mt-1">
              {user.role}
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          <NavLink 
            to="/profile"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive 
                  ? 'bg-milk text-pine font-bold shadow-sm' 
                  : 'text-white/80 font-medium hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </NavLink>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-left"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
