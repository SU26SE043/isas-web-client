import React from 'react';
import { useLanguage } from '@/shared/languages';

interface TabLockOverlayProps {
  visible: boolean;
}

export const TabLockOverlay: React.FC<TabLockOverlayProps> = ({ visible }) => {
  const { t } = useLanguage();

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-6">
      <div className="max-w-md rounded-xl border border-default bg-surface-elevated p-6 text-center">
        <h2 className="heading-secondary text-lg text-foreground">{t('practice.room.tabLockTitle')}</h2>
        <p className="body-text mt-2">{t('practice.room.tabLockDescription')}</p>
      </div>
    </div>
  );
};
