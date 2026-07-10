import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { Skill } from '../../types/profile.types';
import { ProfileSectionCard } from './ProfileSectionCard';
import { ProfileEmptyState } from './ProfileEmptyState';

interface ProfileSkillsSectionProps {
  skills: Skill[];
}

export const ProfileSkillsSection: React.FC<ProfileSkillsSectionProps> = ({ skills }) => {
  const { t } = useLanguage();
  const editHref = '/candidate/profile/skills';

  return (
    <ProfileSectionCard title={t('profile.skills.title')} editHref={editHref} id="profile-skills">
      {skills.length === 0 ? (
        <ProfileEmptyState
          message={t('profile.skills.empty')}
          ctaLabel={t('profile.skills.add')}
          ctaHref={editHref}
        />
      ) : (
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <li key={skill.id}>
              <span className="inline-flex items-center gap-2 rounded-full border border-subtle bg-surface-overlay px-3 py-1.5 text-sm text-foreground">
                {skill.name}
                {skill.level ? (
                  <span className="text-xs text-muted-foreground">
                    {t(`profile.skills.${skill.level}`)}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      )}
    </ProfileSectionCard>
  );
};
