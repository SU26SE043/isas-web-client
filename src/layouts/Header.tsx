import React from 'react';
import { Link } from 'react-router-dom';

const navItems = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Bảng điều khiển', to: '/dashboard' },
  { label: 'Cá nhân', to: '/profile' },
];

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link to="/" className="flex items-center gap-2" aria-label="ISAS homepage">
          <img alt="" className="h-5 w-5" src="/favicon.svg" />
          <span className="text-[11px] font-semibold tracking-tight text-slate-800">ISAS</span>
        </Link>

        <nav className="hidden items-center gap-12 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-sm font-medium text-slate-700 transition-colors hover:text-emerald-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="hidden text-sm font-semibold text-slate-800 transition-colors hover:text-emerald-600 sm:inline"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-100 transition-colors hover:bg-emerald-600"
          >
            Bắt đầu ngay
          </Link>
        </div>
      </div>
    </header>
  );
};
