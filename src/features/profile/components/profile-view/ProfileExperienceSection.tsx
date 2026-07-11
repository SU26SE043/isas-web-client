import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { Experience } from '../../types/profile.types';
import { ProfileSectionCard } from './ProfileSectionCard';
import { ProfileEmptyState } from './ProfileEmptyState';
import { formatProfileDateRange } from './formatProfileDate';

interface ProfileExperienceSectionProps {
  experiences: Experience[];
}

const PREVIEW_LIMIT = 3;

export const ProfileExperienceSection: React.FC<ProfileExperienceSectionProps> = ({ experiences }) => {
  const { t, language } = useLanguage();
  const editHref = '/candidate/profile/experience';
  const preview = experiences.slice(0, PREVIEW_LIMIT);
  const hasMore = experiences.length > PREVIEW_LIMIT;

  return (
    <ProfileSectionCard title={t('profile.experience.title')} editHref={editHref} id="profile-experience">
      {experiences.length === 0 ? (
        <ProfileEmptyState
          message={t('profile.experience.empty')}
          ctaLabel={t('profile.experience.add')}
          ctaHref={editHref}
        />
      ) : (
        <div className="space-y-4">
          <ul className="space-y-6">
            {preview.map((item) => (
              <li key={item.id} className="flex gap-4">
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-subtle bg-surface-overlay"
                  aria-hidden
                >
                  <Briefcase className="size-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1 border-b border-subtle pb-6 last:border-b-0 last:pb-0">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-foreground">{item.company}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {formatProfileDateRange(
                      item.startDate,
                      item.endDate,
                      item.isCurrent,
                      t('profile.experience.current'),
                      language,
                    )}
                  </p>
                  {item.description ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          {hasMore ? (
            <Link to={editHref} className="btn-ghost inline-flex text-sm">
              {t('profile.view.showAll')} ({experiences.length})
            </Link>
          ) : null}
        </div>
      )}
    </ProfileSectionCard>
  );
};
