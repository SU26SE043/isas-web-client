import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLanguage } from '@/shared/languages';
import { ProfileSectionLayout } from '../components/ProfileSectionLayout';
import { useProfile } from '../hooks/useProfile';

const SECTION_LINKS = [
  'career-goal',
  'education',
  'experience',
  'skills',
  'certificates',
  'portfolio',
  'social',
] as const;

export const ProfileViewPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { profile, completeness, isLoading } = useProfile();

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('ds.loading.page')}</span>
      </div>
    );
  }

  return (
    <ProfileSectionLayout
      title={t('profile.view.title')}
      description={t('profile.view.subtitle')}
      completeness={completeness}
      actions={(
        <Link to="/candidate/profile/complete" className="btn-secondary">
          {t('profile.view.completeWizard')}
        </Link>
      )}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-subtle bg-surface-raised p-5">
          <h2 className="heading-secondary text-lg">{t('profile.view.basicInfo')}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">{t('profile.view.name')}</dt>
              <dd className="font-medium text-foreground">{user?.fullName ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('profile.view.titleLabel')}</dt>
              <dd className="font-medium text-foreground">{user?.title || t('profile.view.notSet')}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('profile.view.location')}</dt>
              <dd className="font-medium text-foreground">{user?.location || t('profile.view.notSet')}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-subtle bg-surface-raised p-5">
          <h2 className="heading-secondary text-lg">{t('profile.view.sectionsTitle')}</h2>
          <ul className="mt-4 space-y-2">
            {SECTION_LINKS.map((section) => (
              <li key={section}>
                <Link
                  to={`/candidate/profile/${section}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-surface-overlay"
                >
                  <span>{t(`profile.sections.${section}`)}</span>
                  <span className="text-muted-foreground">
                    {completeness?.sections[section] ? t('profile.sections.complete') : t('profile.sections.incomplete')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ProfileSectionLayout>
  );
};
