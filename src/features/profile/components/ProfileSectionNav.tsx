import React from 'react';
import { NavLink } from 'react-router-dom';
import { Check } from 'lucide-react';
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
    'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
    isActive
      ? 'bg-surface-elevated text-foreground'
      : 'text-muted-foreground hover:bg-surface-overlay hover:text-foreground',
  ].join(' ');

interface ProfileSectionNavProps {
  completedSections?: Partial<Record<ProfileSectionKey | 'basic', boolean>>;
}

export const ProfileSectionNav: React.FC<ProfileSectionNavProps> = ({
  completedSections,
}) => {
  const { t } = useLanguage();

  const renderBadge = (complete?: boolean) =>
    complete ? <Check className="size-3.5 shrink-0 text-success" aria-hidden /> : null;

  return (
    <nav aria-label={t('profile.sections.navLabel')} className="flex flex-wrap gap-2">
      <NavLink to="/candidate/profile" end className={linkClass}>
        {renderBadge(completedSections?.basic)}
        {t('profile.sections.overview')}
      </NavLink>
      {SECTIONS.map((section) => (
        <NavLink key={section} to={`/candidate/profile/${section}`} className={linkClass}>
          {renderBadge(completedSections?.[section])}
          {t(`profile.sections.${section}`)}
        </NavLink>
      ))}
    </nav>
  );
};
