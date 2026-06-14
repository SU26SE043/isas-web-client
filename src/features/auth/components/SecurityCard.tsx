import React from 'react';
import { useLanguage } from '../../../shared/languages';

export const SecurityCard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-2">{t('profile.security')}</h2>
          <p className="text-sm text-gray-500 mb-6">{t('profile.accountSecurityDesc')}</p>
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
              <span className="text-sm font-bold text-black">{t('profile.emailVerified')}</span>
          </div>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
            {t('profile.verified')}
          </span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
              <span className="text-sm font-bold text-black">{t('profile.password')}</span>
          </div>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
            {t('profile.verified')}
          </span>
        </div>
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
              <span className="text-sm font-bold text-black">{t('profile.twoFactor')}</span>
          </div>
          <span className="text-xs font-medium text-orange-600">1 {t('profile.device')}</span>
        </div>
      </div>
    </div>
  );
};