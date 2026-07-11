import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { CareerGoal } from '../../types/profile.types';
import { ProfileSectionCard } from './ProfileSectionCard';
import { ProfileEmptyState } from './ProfileEmptyState';

interface ProfileAboutSectionProps {
  careerGoal?: CareerGoal;
}

export const ProfileAboutSection: React.FC<ProfileAboutSectionProps> = ({ careerGoal }) => {
  const { t } = useLanguage();
  const editHref = '/candidate/profile/career-goal';

  return (
    <ProfileSectionCard title={t('profile.view.about')} editHref={editHref} id="profile-about">
      {!careerGoal?.summary && !careerGoal?.targetRole ? (
        <ProfileEmptyState
          message={t('profile.view.aboutEmpty')}
          ctaLabel={t('profile.view.add')}
          ctaHref={editHref}
        />
      ) : (
        <div className="space-y-4">
          {careerGoal.summary ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{careerGoal.summary}</p>
          ) : null}
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {careerGoal.targetRole ? (
              <div>
                <dt className="text-label text-muted-foreground">{t('profile.careerGoal.targetRole')}</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{careerGoal.targetRole}</dd>
              </div>
            ) : null}
            {careerGoal.targetIndustry ? (
              <div>
                <dt className="text-label text-muted-foreground">{t('profile.careerGoal.targetIndustry')}</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{careerGoal.targetIndustry}</dd>
              </div>
            ) : null}
            {careerGoal.expectedSalary ? (
              <div>
                <dt className="text-label text-muted-foreground">{t('profile.careerGoal.expectedSalary')}</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{careerGoal.expectedSalary}</dd>
              </div>
            ) : null}
            {careerGoal.preferredLocation ? (
              <div>
                <dt className="text-label text-muted-foreground">{t('profile.careerGoal.preferredLocation')}</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{careerGoal.preferredLocation}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      )}
    </ProfileSectionCard>
  );
};
