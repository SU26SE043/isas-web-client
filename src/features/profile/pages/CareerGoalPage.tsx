import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { ProfileSectionLayout } from '../components/ProfileSectionLayout';
import { CareerGoalForm } from '../components/CareerGoalForm';
import { useProfile } from '../hooks/useProfile';

export const CareerGoalPage: React.FC = () => {
  const { t } = useLanguage();
  const { profile, completeness, isLoading, reload } = useProfile();

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <ProfileSectionLayout
      title={t('profile.careerGoal.title')}
      description={t('profile.careerGoal.subtitle')}
      completeness={completeness}
    >
      <div className="rounded-xl border border-subtle bg-surface-raised p-6">
        <CareerGoalForm initial={profile.careerGoal} onSaved={() => void reload()} />
      </div>
    </ProfileSectionLayout>
  );
};
