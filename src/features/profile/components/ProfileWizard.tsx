import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { ProfileCompleteness, ProfileSectionKey } from '../types/profile.types';

const WIZARD_STEPS: Array<{
  key: ProfileSectionKey | 'basic';
  route: string;
}> = [
  { key: 'basic', route: '/candidate/profile' },
  { key: 'career-goal', route: '/candidate/profile/career-goal' },
  { key: 'education', route: '/candidate/profile/education' },
  { key: 'experience', route: '/candidate/profile/experience' },
  { key: 'skills', route: '/candidate/profile/skills' },
  { key: 'certificates', route: '/candidate/profile/certificates' },
  { key: 'portfolio', route: '/candidate/profile/portfolio' },
  { key: 'social', route: '/candidate/profile/social' },
];

interface ProfileWizardProps {
  completeness: ProfileCompleteness;
  stepIndex: number;
  onStepChange: (index: number) => void;
}

export const ProfileWizard: React.FC<ProfileWizardProps> = ({
  completeness,
  stepIndex,
  onStepChange,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const currentStep = WIZARD_STEPS[stepIndex];

  const incompleteSteps = useMemo(
    () => WIZARD_STEPS.filter((step) => !completeness.sections[step.key]).length,
    [completeness.sections],
  );

  const goNext = () => {
    if (stepIndex >= WIZARD_STEPS.length - 1) {
      navigate('/candidate/profile');
      return;
    }
    onStepChange(stepIndex + 1);
  };

  const hintKey =
    currentStep.key === 'basic'
      ? 'profile.wizard.basicHint'
      : `profile.wizard.${currentStep.key}Hint`;

  return (
    <div className="rounded-xl border border-subtle bg-surface-raised p-6">
      <div className="mb-6 flex flex-wrap gap-2">
        {WIZARD_STEPS.map((step, index) => {
          const complete = completeness.sections[step.key];
          const active = index === stepIndex;
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onStepChange(index)}
              className={[
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'border-default bg-surface-elevated text-foreground'
                  : 'border-subtle text-muted-foreground hover:border-default hover:text-foreground',
              ].join(' ')}
            >
              {complete ? <Check className="size-3.5 text-success" aria-hidden /> : null}
              <span>
                {step.key === 'basic'
                  ? t('profile.wizard.basicStep')
                  : t(`profile.sections.${step.key}`)}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-label text-muted-foreground">
        {t('profile.wizard.stepLabel')} {stepIndex + 1} / {WIZARD_STEPS.length}
        {incompleteSteps > 0
          ? ` · ${t('profile.wizard.remaining').replace('{count}', String(incompleteSteps))}`
          : null}
      </p>
      <h2 className="heading-secondary mt-2 text-xl">
        {currentStep.key === 'basic'
          ? t('profile.wizard.basicStep')
          : t(`profile.sections.${currentStep.key}`)}
      </h2>
      <p className="body-text mt-2">{t(hintKey)}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={goNext}>
          {stepIndex >= WIZARD_STEPS.length - 1
            ? t('profile.wizard.finish')
            : t('profile.wizard.next')}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate(currentStep.route)}
        >
          {t('profile.wizard.openSection')}
        </button>
      </div>
    </div>
  );
};
