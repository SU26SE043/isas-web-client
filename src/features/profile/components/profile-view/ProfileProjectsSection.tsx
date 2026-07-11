import React from 'react';
import { FolderKanban, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { PortfolioProject } from '../../types/profile.types';
import { ProfileSectionCard } from './ProfileSectionCard';
import { ProfileEmptyState } from './ProfileEmptyState';

interface ProfileProjectsSectionProps {
  portfolio: PortfolioProject[];
}

export const ProfileProjectsSection: React.FC<ProfileProjectsSectionProps> = ({ portfolio }) => {
  const { t } = useLanguage();
  const editHref = '/candidate/profile/portfolio';

  return (
    <ProfileSectionCard title={t('profile.portfolio.title')} editHref={editHref} id="profile-projects">
      {portfolio.length === 0 ? (
        <ProfileEmptyState
          message={t('profile.portfolio.empty')}
          ctaLabel={t('profile.portfolio.add')}
          ctaHref={editHref}
        />
      ) : (
        <ul className="space-y-5">
          {portfolio.map((item) => (
            <li key={item.id} className="flex gap-4">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-subtle bg-surface-overlay"
                aria-hidden
              >
                <FolderKanban className="size-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                {item.techStack ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.techStack}</p>
                ) : null}
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-foreground underline-offset-4 hover:underline"
                  >
                    {t('profile.view.openLink')}
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </ProfileSectionCard>
  );
};
