import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { ProfileSectionNav } from './ProfileSectionNav';
import { ProfileCompletenessBar } from './ProfileCompletenessBar';
import type { ProfileCompleteness } from '../types/profile.types';

interface ProfileSectionLayoutProps {
  title: string;
  description?: string;
  completeness?: ProfileCompleteness | null;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const ProfileSectionLayout: React.FC<ProfileSectionLayoutProps> = ({
  title,
  description,
  completeness,
  children,
  actions,
}) => {
  const { t } = useLanguage();

  return (
    <div className="dashboard-content min-h-full">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-label text-muted-foreground mb-1">
            <Link to="/candidate/profile" className="hover:text-foreground">
              {t('profile.breadcrumb')}
            </Link>
          </p>
          <h1 className="heading-primary text-2xl">{title}</h1>
          {description ? <p className="body-text mt-2 max-w-2xl">{description}</p> : null}
        </div>
        {actions}
      </div>

      {completeness ? (
        <div className="mb-6 rounded-xl border border-subtle bg-surface-raised p-4">
          <ProfileCompletenessBar percent={completeness.percent} showGateHint />
        </div>
      ) : null}

      <div className="mb-6">
        <ProfileSectionNav completedSections={completeness?.sections} />
      </div>

      {children}
    </div>
  );
};
