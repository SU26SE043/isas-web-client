import React from 'react';
import { useLanguage } from '@/shared/languages';

interface NetworkLossDialogProps {
  open: boolean;
}

export const NetworkLossDialog: React.FC<NetworkLossDialogProps> = ({ open }) => {
  const { t } = useLanguage();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-6">
      <div
        role="alertdialog"
        aria-labelledby="network-loss-title"
        aria-describedby="network-loss-desc"
        className="max-w-md rounded-xl border border-default bg-surface-elevated p-6"
      >
        <h2 id="network-loss-title" className="heading-secondary text-lg text-foreground">
          {t('practice.room.networkLossTitle')}
        </h2>
        <p id="network-loss-desc" className="body-text mt-2">
          {t('practice.room.networkLossDescription')}
        </p>
        <p className="mt-3 text-caption text-muted-foreground">{t('practice.room.networkLossHint')}</p>
      </div>
    </div>
  );
};
