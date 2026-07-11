import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { Education } from '../../types/profile.types';
import { ProfileSectionCard } from './ProfileSectionCard';
import { ProfileEmptyState } from './ProfileEmptyState';
import { formatProfileDateRange } from './formatProfileDate';

interface ProfileEducationSectionProps {
  education: Education[];
}

const PREVIEW_LIMIT = 3;

export const ProfileEducationSection: React.FC<ProfileEducationSectionProps> = ({ education }) => {
  const { t, language } = useLanguage();
  const editHref = '/candidate/profile/education';
  const preview = education.slice(0, PREVIEW_LIMIT);
  const hasMore = education.length > PREVIEW_LIMIT;

  return (
    <ProfileSectionCard title={t('profile.education.title')} editHref={editHref} id="profile-education">
      {education.length === 0 ? (
        <ProfileEmptyState
          message={t('profile.education.empty')}
          ctaLabel={t('profile.education.add')}
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
                  <GraduationCap className="size-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1 border-b border-subtle pb-6 last:border-b-0 last:pb-0">
                  <h3 className="font-semibold text-foreground">{item.school}</h3>
                  <p className="text-sm text-foreground">
                    {item.degree}
                    {item.fieldOfStudy ? `, ${item.fieldOfStudy}` : ''}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {formatProfileDateRange(
                      item.startDate,
                      item.endDate,
                      item.isCurrent,
                      t('profile.education.current'),
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
              {t('profile.view.showAll')} ({education.length})
            </Link>
          ) : null}
        </div>
      )}
    </ProfileSectionCard>
  );
};
