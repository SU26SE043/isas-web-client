import React from 'react';
import { useLanguage } from '@/shared/languages';

interface ProctoringAlertBannerProps {
  violationCount: number;
}

export const ProctoringAlertBanner: React.FC<ProctoringAlertBannerProps> = ({ violationCount }) => {
  const { t } = useLanguage();

  if (violationCount === 0) return null;

  return (
    <div
      role="alert"
      className="border-b border-warning-500/30 bg-warning-500/10 px-6 py-3 text-sm text-warning-300"
    >
      {t('practice.room.proctoringWarning').replace('{count}', String(violationCount))}
    </div>
  );
};

