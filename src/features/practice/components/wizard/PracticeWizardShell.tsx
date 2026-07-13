import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';

export const WIZARD_STEP_KEYS = [
  'practice.wizard.steps.domain',
  'practice.wizard.steps.level',
  'practice.wizard.steps.cv',
  'practice.wizard.steps.questions',
  'practice.wizard.steps.rubric',
  'practice.wizard.steps.confirm',
] as const;

interface PracticeWizardShellProps {
  currentStep: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const PracticeWizardShell: React.FC<PracticeWizardShellProps> = ({
  currentStep,
  title,
  description,
  children,
}) => {
  const { t } = useLanguage();

  return (
    <div className="page-container page-section min-h-screen">
      <div className="mx-auto max-w-3xl">
        <nav aria-label={t('practice.wizard.stepperLabel')} className="mb-8">
          <ol className="flex flex-wrap gap-2">
            {WIZARD_STEP_KEYS.map((key, index) => {
              const isActive = index === currentStep;
              const isComplete = index < currentStep;
              return (
                <li
                  key={key}
                  className={[
                    'rounded-full border px-3 py-1 text-xs font-medium',
                    isActive
                      ? 'border-default bg-surface-elevated text-foreground'
                      : isComplete
                        ? 'border-subtle bg-surface-overlay text-foreground'
                        : 'border-subtle text-muted-foreground',
                  ].join(' ')}
                >
                  {t(key)}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="mb-6">
          <Link
            to="/candidate/dashboard"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            {t('practice.flow.backToDashboard')}
          </Link>
          <h1 className="heading-primary mt-3 text-3xl">{title}</h1>
          {description ? <p className="body-text mt-2">{description}</p> : null}
        </div>

        {children}
      </div>
    </div>
  );
};
