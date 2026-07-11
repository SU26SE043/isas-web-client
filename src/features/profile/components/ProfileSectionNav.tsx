import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import type { ProfileSectionKey } from '../types/profile.types';

const SECTIONS: ProfileSectionKey[] = [
  'career-goal',
  'education',
  'experience',
  'skills',
  'certificates',
  'portfolio',
  'social',
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
    isActive
      ? 'bg-surface-elevated text-foreground'
      : 'text-muted-foreground hover:bg-surface-overlay hover:text-foreground',
  ].join(' ');

interface ProfileSectionNavProps {
  completedSections?: Partial<Record<ProfileSectionKey | 'basic', boolean>>;
}

export const ProfileSectionNav: React.FC<ProfileSectionNavProps> = () => {
  const { t } = useLanguage();

  return (
    <nav aria-label={t('profile.sections.navLabel')} className="flex flex-wrap gap-2">
      <NavLink to="/candidate/profile" end className={linkClass}>
        {t('profile.sections.overview')}
      </NavLink>
      {SECTIONS.map((section) => (
        <NavLink key={section} to={`/candidate/profile/${section}`} className={linkClass}>
          {t(`profile.sections.${section}`)}
        </NavLink>
      ))}
    </nav>
  );
};
