import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';
import { useLanguage } from '../../../shared/languages';

export const InterviewHeader: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className="bg-surface-raised px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-6">
        <Link to="/">
          <BrandLogo />
        </Link>
        <div className="h-6 w-px bg-surface-raised/30"></div>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white">{t('practice.title')}</h1>
        </div>
      </div>

      {/* Right: Status & Actions */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 bg-surface-overlay/40 px-4 py-1.5 rounded-lg border border-default ">
          <svg className="w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xl font-black text-foreground tabular-nums tracking-wider leading-none">12:35</span>
        </div>
        <div className="flex items-center gap-2 bg-error text-white px-3 py-1.5 rounded-full ">
          <div className="w-2 h-2 rounded-full bg-surface-raised animate-pulse"></div>
          <span className="text-sm font-medium">{t('practice.recording')}</span>
        </div>
        <button className="px-4 py-2 bg-surface-overlay text-foreground rounded-lg text-sm font-black hover:bg-surface-elevated transition-colors shadow-sm cursor-pointer">
          {t('practice.exit')}
        </button>
      </div>
    </header>
  );
};
