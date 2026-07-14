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
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto mb-10 max-w-4xl space-y-3">
        <h1 className="heading-primary text-3xl tracking-tight sm:text-4xl">{t('cv.title')}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t('cv.description')}
        </p>
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
