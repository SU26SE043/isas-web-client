import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { ProfileSectionLayout } from '../components/ProfileSectionLayout';
import { SkillsTagInput } from '../components/SkillsTagInput';
import { useProfile } from '../hooks/useProfile';

export const SkillsPage: React.FC = () => {
  const { t } = useLanguage();
  const { profile, completeness, isLoading, reload } = useProfile();

  if (isLoading || !profile) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden /></div>;
  }

  return (
    <ProfileSectionLayout title={t('profile.skills.title')} description={t('profile.skills.subtitle')} completeness={completeness}>
      <div className="rounded-xl border border-subtle bg-surface-raised p-6">
        <SkillsTagInput initialSkills={profile.skills} onSaved={() => void reload()} />
      </div>
    </ProfileSectionLayout>
  );
};
