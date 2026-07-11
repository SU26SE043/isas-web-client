import React from 'react';
import { useLanguage } from '@/shared/languages';

interface PauseOverlayProps {
  visible: boolean;
  onResume: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({ visible, onResume }) => {
  const { t } = useLanguage();

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/75 px-6">
      <div className="max-w-md rounded-xl border border-default bg-surface-elevated p-6 text-center">
        <h2 className="heading-secondary text-lg text-foreground">{t('practice.room.pauseTitle')}</h2>
        <p className="body-text mt-2">{t('practice.room.pauseDescription')}</p>
        <button type="button" className="btn-primary mt-6" onClick={onResume}>
          {t('practice.room.resume')}
        </button>
      </div>
    </div>
  );
};
