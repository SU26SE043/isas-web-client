import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../shared/languages';

export const InterviewHeader: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className="bg-pine px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-6">
        <Link to="/">
          <img src="/logo-horizontal-white.png" alt="PraInt Logo" className="h-8 w-auto object-contain" />
        </Link>
        <div className="h-6 w-px bg-white/30"></div>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white">{t('practice.title')}</h1>
        </div>
      </div>

      {/* Right: Status & Actions */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-lg border border-white/20 shadow-inner">
          <svg className="w-4 h-4 text-milk" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xl font-black text-milk tabular-nums tracking-wider leading-none">12:35</span>
        </div>
        <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full shadow-inner">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          <span className="text-sm font-medium">{t('practice.recording')}</span>
        </div>
        <button className="px-4 py-2 bg-milk text-pine rounded-lg text-sm font-black hover:bg-yellow-400 transition-colors shadow-sm cursor-pointer">
          {t('practice.exit')}
        </button>
      </div>
    </header>
  );
};
