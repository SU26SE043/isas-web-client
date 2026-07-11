import React from 'react';
import { CvAnalysisStepper, type CvAnalysisStep } from '../CvAnalysisStepper';

interface CvAnalysisFlowShellProps {
  currentStep: CvAnalysisStep;
  children: React.ReactNode;
}

export const CvAnalysisFlowShell: React.FC<CvAnalysisFlowShellProps> = ({ currentStep, children }) => {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <CvAnalysisStepper currentStep={currentStep} />
      {children}
    </div>
  );
};
