import React from 'react';
import { useLanguage } from '@/shared/languages';
import { ProfileSectionNav } from './ProfileSectionNav';
import { ProfileCompletenessBar } from './ProfileCompletenessBar';
import type { ProfileCompleteness } from '../types/profile.types';
import { PageHeader } from '@/components/patterns/PageHeader';

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
    <div className="app-page min-h-full">
      <PageHeader
        className="mb-6"
        backLink={{ to: '/candidate/profile', label: t('profile.breadcrumb') }}
        title={title}
        description={description}
        actions={actions}
      />

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
