import React from 'react';
import type { FlowStepStatus } from '@/components/ui/flow-stepper';
import { FlowWizardShell } from '@/components/patterns/flow-wizard/FlowWizardShell';
import { useLanguage } from '@/shared/languages';
import {
  buildCvTimelineStatuses,
  CV_TIMELINE_STEP_LABEL_KEYS,
  CV_TIMELINE_STEPS,
  type CvAnalysisStep,
  type CvTimelineStatuses,
} from '../../utils/cvTimelineStatus';

interface CvAnalysisFlowShellProps {
  currentStep: CvAnalysisStep;
  statuses?: CvTimelineStatuses;
  failedStep?: CvAnalysisStep;
  onStepClick?: (stepIndex: number) => void;
  children: React.ReactNode;
}

export const CvAnalysisFlowShell: React.FC<CvAnalysisFlowShellProps> = ({
  currentStep,
  statuses: statusesProp,
  failedStep,
  onStepClick,
  children,
}) => {
  const { t } = useLanguage();
  const activeIndex = CV_TIMELINE_STEPS.indexOf(currentStep);
  const statuses =
    statusesProp ??
    buildCvTimelineStatuses({
      activeIndex,
      failedStep: failedStep ?? null,
      isProcessing: false,
    });

  return (
    <FlowWizardShell
      accent="indigo"
      currentStep={activeIndex}
      steps={CV_TIMELINE_STEPS.map((step) => t(CV_TIMELINE_STEP_LABEL_KEYS[step]))}
      stepperAriaLabel={t('cv.flowLabel')}
      stepOfLabel={t('cv.step.progress')}
      pageTitle={t('cv.title')}
      backLink={{
        to: '/candidate/dashboard',
        label: t('practice.flow.backToDashboard'),
      }}
      onStepClick={onStepClick}
      resolveStatus={(index) => statuses[CV_TIMELINE_STEPS[index]!] as FlowStepStatus}
    >
      {children}
    </FlowWizardShell>
  );
};
