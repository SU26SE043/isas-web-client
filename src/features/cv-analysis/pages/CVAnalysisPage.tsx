import React, { useMemo } from 'react';
import { useLanguage } from '@/shared/languages';
import { CvAnalysisFlowShell } from '../components/flow/CvAnalysisFlowShell';
import { CvUploadStep } from '../components/flow/CvUploadStep';
import { CvJobDescriptionStep } from '../components/flow/CvJobDescriptionStep';
import { CvAnalysisProgressStep } from '../components/flow/CvAnalysisProgressStep';
import type { CvAnalysisStep } from '../components/CvAnalysisStepper';
import { useCvAnalysisFlow } from '../hooks/useCvAnalysisFlow';

export const CVAnalysisPage: React.FC = () => {
  const { t } = useLanguage();
  const flow = useCvAnalysisFlow();

  const currentStep = useMemo<CvAnalysisStep>(() => {
    if (flow.step === 3) return 'analysis';
    if (flow.step === 2) return 'job-description';
    return 'upload';
  }, [flow.step]);

  return (
    <div className="dashboard-content min-h-full pb-12">
      <div className="mb-8 space-y-2">
        <h1 className="heading-primary text-3xl tracking-tight">{t('cv.title')}</h1>
        <p className="body-text max-w-2xl">{t('cv.description')}</p>
      </div>

      <CvAnalysisFlowShell currentStep={currentStep}>
        {flow.step === 1 ? (
          <CvUploadStep
            file={flow.file}
            fileError={flow.fileError}
            onFileSelect={flow.selectFile}
            onNext={flow.goNext}
          />
        ) : null}

        {flow.step === 2 ? (
          <CvJobDescriptionStep
            jobDescription={flow.jobDescription}
            fileName={flow.file?.name}
            onJobDescriptionChange={flow.setJobDescription}
            onBack={flow.goBack}
            onNext={() => void flow.runAnalysis()}
          />
        ) : null}

        {flow.step === 3 ? (
          <CvAnalysisProgressStep
            parseProgress={flow.parseProgress}
            parseError={flow.parseErrorMessage}
            onRetry={flow.parseError ? flow.retryFromUpload : undefined}
          />
        ) : null}
      </CvAnalysisFlowShell>
    </div>
  );
};
