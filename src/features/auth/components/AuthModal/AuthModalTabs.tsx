import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../../shared/languages';
import { cn } from '@/lib/utils';
import { PREMIUM_EASE } from './authModal.animations';

export type AuthTab = 'login' | 'signup';

interface AuthModalTabsProps {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  reducedMotion: boolean | null;
}

export const AuthModalTabs: React.FC<AuthModalTabsProps> = ({
  activeTab,
  onTabChange,
  reducedMotion,
}) => {
  const { t } = useLanguage();

  const tabs: { id: AuthTab; label: string }[] = [
    { id: 'login', label: t('auth.signInTitle') },
    { id: 'signup', label: t('auth.signUp') },
  ];

  return (
    <div
      role="tablist"
      aria-label={t('auth.modalTabsLabel')}
      className="relative mb-8 flex gap-1 rounded-xl border border-subtle bg-surface-overlay/60 p-1"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`auth-tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`auth-panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative z-10 flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-ring',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {isActive ? (
              <motion.span
                layoutId="auth-tab-indicator"
                className="absolute inset-0 rounded-lg border border-default bg-surface-elevated shadow-sm"
                transition={
                  reducedMotion
                    ? { duration: 0.01 }
                    : { duration: 0.35, ease: PREMIUM_EASE }
                }
              />
            ) : null}
            <span className="relative">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
