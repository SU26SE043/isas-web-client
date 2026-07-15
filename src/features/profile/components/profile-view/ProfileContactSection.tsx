import React from 'react';
import { Code2, ExternalLink, Globe, Link2, Share2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { SocialLinks } from '../../types/profile.types';
import { ProfileSectionCard } from './ProfileSectionCard';
import { ProfileEmptyState } from './ProfileEmptyState';

interface ProfileContactSectionProps {
  socialLinks: SocialLinks;
}

const LINK_CONFIG = [
  { key: 'linkedin' as const, icon: Link2, labelKey: 'profile.social.linkedin' },
  { key: 'github' as const, icon: Code2, labelKey: 'profile.social.github' },
  { key: 'website' as const, icon: Globe, labelKey: 'profile.social.website' },
  { key: 'twitter' as const, icon: Share2, labelKey: 'profile.social.twitter' },
];

export const ProfileContactSection: React.FC<ProfileContactSectionProps> = ({ socialLinks }) => {
  const { t } = useLanguage();
  const editHref = '/candidate/profile/social';
  const activeLinks = LINK_CONFIG.filter((link) => Boolean(socialLinks[link.key]));

  return (
    <ProfileSectionCard title={t('profile.view.contact')} editHref={editHref} id="profile-contact">
      {activeLinks.length === 0 ? (
        <ProfileEmptyState
          message={t('profile.view.contactEmpty')}
          ctaLabel={t('profile.social.save')}
          ctaHref={editHref}
        />
      ) : (
        <ul className="space-y-3">
          {activeLinks.map(({ key, icon: Icon, labelKey }) => {
            const href = socialLinks[key]!;
            return (
              <li key={key}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-lg border border-subtle bg-surface-overlay px-3 py-2.5 text-sm transition-colors hover:bg-surface-elevated"
                >
                  <span className="flex min-w-0 items-center gap-2.5 text-foreground">
                    <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="truncate font-medium">{t(labelKey)}</span>
                  </span>
                  <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </ProfileSectionCard>
  );
};
