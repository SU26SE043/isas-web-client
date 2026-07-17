import React from 'react';
import { CvAnalysisStepper, type CvAnalysisStep } from '../CvAnalysisStepper';
import type { CvTimelineStatuses } from '../../utils/cvTimelineStatus';

interface CvAnalysisFlowShellProps {
  currentStep: CvAnalysisStep;
  statuses?: CvTimelineStatuses;
  failedStep?: CvAnalysisStep;
  children: React.ReactNode;
}

export const CvAnalysisFlowShell: React.FC<CvAnalysisFlowShellProps> = ({
  currentStep,
  statuses,
  failedStep,
  children,
}) => {
  return (
    <div className="mx-auto grid w-full max-w-[1600px] gap-8 lg:grid-cols-5 lg:items-start lg:gap-10">
      <aside className="lg:sticky lg:top-8 lg:col-span-1 lg:self-start">
        <CvAnalysisStepper
          currentStep={currentStep}
          statuses={statuses}
          failedStep={failedStep}
        />
      </aside>
      <div className="min-w-0 lg:col-span-4">{children}</div>
    </div>
  );
};
