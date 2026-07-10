import React from 'react';
import { useLanguage } from '../../../shared/languages';

export const SecurityCard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-surface-raised rounded-xl border border-subtle p-8">
      <h2 className="text-xl font-bold text-foreground mb-2">{t('profile.security')}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t('profile.accountSecurityDesc')}</p>
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-subtle">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-success" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
              <span className="text-sm font-bold text-foreground">{t('profile.emailVerified')}</span>
          </div>
          <span className="text-xs font-medium text-success bg-success-bg px-3 py-1 rounded-full">
            {t('profile.verified')}
          </span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-subtle">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-success" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
              <span className="text-sm font-bold text-foreground">{t('profile.password')}</span>
          </div>
          <span className="text-xs font-medium text-success bg-success-bg px-3 py-1 rounded-full">
            {t('profile.verified')}
          </span>
        </div>
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-warning" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
              <span className="text-sm font-bold text-foreground">{t('profile.twoFactor')}</span>
          </div>
          <span className="text-xs font-medium text-warning">1 {t('profile.device')}</span>
        </div>
      </div>
    </div>
  );
};