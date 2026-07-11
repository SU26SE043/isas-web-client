import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';

export const InterviewActivityEmptyState: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-subtle bg-surface-overlay/40 px-6 py-12 text-center">
      <p className="text-base font-semibold text-foreground">{t('profile.dashboard.heatmapEmptyTitle')}</p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {t('profile.dashboard.heatmapEmptyDescription')}
      </p>
      <Link to="/practice" className="btn-primary mt-6 inline-flex items-center justify-center px-5 py-2.5 text-sm">
        {t('profile.dashboard.heatmapStartInterview')}
      </Link>
    </div>
  );
};
