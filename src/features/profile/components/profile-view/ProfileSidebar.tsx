import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { ProfileCompletenessBar, ProfileCompletenessCta } from '../ProfileCompletenessBar';
import type { ProfileCompleteness } from '../../types/profile.types';

const SIDEBAR_SECTIONS = [
  'career-goal',
  'experience',
  'education',
  'skills',
  'certificates',
  'portfolio',
  'social',
] as const;

interface ProfileSidebarProps {
  completeness: ProfileCompleteness;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ completeness }) => {
  const { t } = useLanguage();

  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      <div className="rounded-xl border border-subtle bg-surface-raised p-4 sm:p-5">
        <h2 className="heading-secondary mb-3 text-base">{t('profile.view.profileStrength')}</h2>
        <ProfileCompletenessBar percent={completeness.percent} showGateHint />
        <Link to="/candidate/profile/complete" className="btn-secondary mt-4 inline-flex w-full justify-center text-sm">
          {t('profile.view.completeWizard')}
        </Link>
      </div>

      <ProfileCompletenessCta percent={completeness.percent} />

      <nav
        className="rounded-xl border border-subtle bg-surface-raised p-4 sm:p-5"
        aria-label={t('profile.view.sectionStatus')}
      >
        <h2 className="heading-secondary mb-3 text-base">{t('profile.view.sectionStatus')}</h2>
        <ul className="space-y-1">
          {SIDEBAR_SECTIONS.map((section) => {
            const isComplete = completeness.sections[section];
            return (
              <li key={section}>
                <Link
                  to={`/candidate/profile/${section}`}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-surface-overlay"
                >
                  <span className="text-foreground">{t(`profile.sections.${section}`)}</span>
                  <span className={isComplete ? 'text-emerald-400' : 'text-muted-foreground'}>
                    {isComplete ? t('profile.sections.complete') : t('profile.sections.incomplete')}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
