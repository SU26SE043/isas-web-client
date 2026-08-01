import React from 'react';
import { FlowWizardShell } from '@/components/patterns/flow-wizard/FlowWizardShell';
import { useLanguage } from '@/shared/languages';

export const WIZARD_STEP_KEYS = [
  'practice.setup.steps.jobCategory',
  'practice.setup.steps.cv',
  'practice.setup.steps.jd',
  'practice.setup.steps.timeLimit',
  'practice.setup.steps.questionCount',
  'practice.setup.steps.gradingCriteria',
  'practice.setup.steps.summary',
] as const;

interface PracticeWizardShellProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  children: React.ReactNode;
}

export const PracticeWizardShell: React.FC<PracticeWizardShellProps> = ({
  currentStep,
  onStepClick,
  children,
}) => {
  const { t } = useLanguage();
  const steps = WIZARD_STEP_KEYS.map((key) => t(key));

  return (
    <FlowWizardShell
      accent="blue"
      currentStep={currentStep}
      steps={steps}
      stepperAriaLabel={t('practice.wizard.stepperLabel')}
      stepOfLabel={t('practice.wizard.stepOf')}
      pageTitle={t('practice.setup.title')}
      backLink={{
        to: '/candidate/dashboard',
        label: t('practice.flow.backToDashboard'),
      }}
      onStepClick={onStepClick}
    >
      {children}
    </FlowWizardShell>
  );
};
