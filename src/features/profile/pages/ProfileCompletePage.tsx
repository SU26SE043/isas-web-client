import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { ProfileSectionLayout } from '../components/ProfileSectionLayout';
import { ProfileWizard } from '../components/ProfileWizard';
import { useProfile } from '../hooks/useProfile';

export const ProfileCompletePage: React.FC = () => {
  const { t } = useLanguage();
  const { completeness, isLoading } = useProfile();
  const [stepIndex, setStepIndex] = useState(0);

  if (isLoading || !completeness) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <ProfileSectionLayout
      title={t('profile.wizard.title')}
      description={t('profile.wizard.subtitle')}
      completeness={completeness}
    >
      <ProfileWizard
        completeness={completeness}
        stepIndex={stepIndex}
        onStepChange={setStepIndex}
      />
    </ProfileSectionLayout>
  );
};
