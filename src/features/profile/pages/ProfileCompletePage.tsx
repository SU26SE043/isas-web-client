import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { ProfileSectionLayout } from '../components/ProfileSectionLayout';
import { useProfile } from '../hooks/useProfile';

const WIZARD_STEPS = [
  'career-goal',
  'education',
  'experience',
  'skills',
] as const;

export const ProfileCompletePage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { completeness } = useProfile();
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = WIZARD_STEPS[stepIndex];

  const goNext = () => {
    if (stepIndex >= WIZARD_STEPS.length - 1) {
      navigate('/candidate/profile');
      return;
    }
    setStepIndex((value) => value + 1);
  };

  return (
    <ProfileSectionLayout
      title={t('profile.wizard.title')}
      description={t('profile.wizard.subtitle')}
      completeness={completeness}
    >
      <div className="rounded-xl border border-subtle bg-surface-raised p-6">
        <p className="text-label text-muted-foreground">
          {t('profile.wizard.stepLabel')} {stepIndex + 1} / {WIZARD_STEPS.length}
        </p>
        <h2 className="heading-secondary mt-2 text-xl">{t(`profile.sections.${currentStep}`)}</h2>
        <p className="body-text mt-2">{t(`profile.wizard.${currentStep}Hint`)}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={goNext}>
            {stepIndex >= WIZARD_STEPS.length - 1 ? t('profile.wizard.finish') : t('profile.wizard.next')}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(`/candidate/profile/${currentStep}`)}
          >
            {t('profile.wizard.openSection')}
          </button>
        </div>
      </div>
    </ProfileSectionLayout>
  );
};
