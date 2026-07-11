import React from 'react';
import { Award, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { Certificate } from '../../types/profile.types';
import { ProfileSectionCard } from './ProfileSectionCard';
import { ProfileEmptyState } from './ProfileEmptyState';
import { formatProfileDate } from './formatProfileDate';

interface ProfileCertificationsSectionProps {
  certificates: Certificate[];
}

export const ProfileCertificationsSection: React.FC<ProfileCertificationsSectionProps> = ({
  certificates,
}) => {
  const { t, language } = useLanguage();
  const editHref = '/candidate/profile/certificates';

  return (
    <ProfileSectionCard title={t('profile.certificates.title')} editHref={editHref} id="profile-certificates">
      {certificates.length === 0 ? (
        <ProfileEmptyState
          message={t('profile.certificates.empty')}
          ctaLabel={t('profile.certificates.add')}
          ctaHref={editHref}
        />
      ) : (
        <ul className="space-y-5">
          {certificates.map((item) => (
            <li key={item.id} className="flex gap-4">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-subtle bg-surface-overlay"
                aria-hidden
              >
                <Award className="size-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                <p className="text-sm text-foreground">{item.issuer}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {t('profile.certificates.issueDate')}: {formatProfileDate(item.issueDate, language)}
                </p>
                {item.credentialUrl ? (
                  <a
                    href={item.credentialUrl}
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
