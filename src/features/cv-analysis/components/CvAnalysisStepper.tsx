import React from 'react';
import { FlowWizardSidebar } from '@/components/patterns/flow-wizard/FlowWizardSidebar';
import type { FlowStepStatus } from '@/components/ui/flow-stepper';
import { useLanguage } from '@/shared/languages';
import {
  buildCvTimelineStatuses,
  CV_TIMELINE_STEPS,
  type CvTimelineStatuses,
} from '../utils/cvTimelineStatus';

export type CvAnalysisStep = 'domain' | 'upload' | 'github' | 'job-description' | 'analysis' | 'report';

const STEP_KEYS: Record<CvAnalysisStep, string> = {
  domain: 'cv.step.domain',
  upload: 'cv.step.upload',
  github: 'cv.step.github',
  'job-description': 'cv.step.jobDescription',
  analysis: 'cv.step.analysis',
  report: 'cv.step.report',
};

interface CvAnalysisStepperProps {
  currentStep: CvAnalysisStep;
  statuses?: CvTimelineStatuses;
  failedStep?: CvAnalysisStep;
  onStepClick?: (index: number) => void;
  className?: string;
}

export const CvAnalysisStepper: React.FC<CvAnalysisStepperProps> = ({
  currentStep,
  statuses: statusesProp,
  failedStep,
  onStepClick,
  className,
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

  const labels = CV_TIMELINE_STEPS.map((step) => t(STEP_KEYS[step]));

  return (
    <FlowWizardSidebar
      accent="indigo"
      steps={labels}
      currentStep={activeIndex}
      ariaLabel={t('cv.flowLabel')}
      resolveStatus={(index) => statuses[CV_TIMELINE_STEPS[index]!] as FlowStepStatus}
      onStepClick={onStepClick}
      className={className}
    />
  );
};
