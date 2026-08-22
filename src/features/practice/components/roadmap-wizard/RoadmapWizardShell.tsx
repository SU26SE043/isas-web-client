import React from 'react';
import { FlowWizardShell } from '@/components/patterns/flow-wizard/FlowWizardShell';
import { useLanguage } from '@/shared/languages';

const ROADMAP_WIZARD_STEPS = [
  'practice.roadmapWizard.steps.domain',
  'practice.roadmapWizard.steps.cv',
  'practice.roadmapWizard.steps.currentLevel',
  'practice.roadmapWizard.steps.mode',
  'practice.roadmapWizard.steps.level',
  'practice.roadmapWizard.steps.reports',
  'practice.roadmapWizard.steps.priorRoadmap',
  'practice.roadmapWizard.steps.confirm',
] as const;

export const ROADMAP_WIZARD_STEP_KEYS = [...ROADMAP_WIZARD_STEPS];

interface RoadmapWizardShellProps {
  currentStep: number;
  stepKeys?: readonly string[];
  onStepClick?: (step: number) => void;
  children: React.ReactNode;
}

export const RoadmapWizardShell: React.FC<RoadmapWizardShellProps> = ({
  currentStep,
  stepKeys = ROADMAP_WIZARD_STEPS,
  onStepClick,
  children,
}) => {
  const { t } = useLanguage();
  const steps = stepKeys.map((key) => t(key));

  return (
    <FlowWizardShell
      accent="emerald"
      currentStep={currentStep}
      steps={steps}
      stepperAriaLabel={t('practice.roadmapWizard.stepperLabel')}
      stepOfLabel={t('practice.roadmapWizard.stepOf')}
      pageTitle={t('practice.roadmapWizard.createTitle')}
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
