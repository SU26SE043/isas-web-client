import React from 'react';
import { CvAnalysisStepper, type CvAnalysisStep } from '../CvAnalysisStepper';

interface CvAnalysisFlowShellProps {
  currentStep: CvAnalysisStep;
  children: React.ReactNode;
}

export const CvAnalysisFlowShell: React.FC<CvAnalysisFlowShellProps> = ({ currentStep, children }) => {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div className="frame-satin rounded-2xl bg-white/[0.02] px-4 py-5 backdrop-blur-sm sm:px-6 sm:py-6">
        <CvAnalysisStepper currentStep={currentStep} />
      </div>
      {children}
    </div>
  );
};
