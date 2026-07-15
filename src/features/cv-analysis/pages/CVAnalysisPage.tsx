import React, { useMemo } from 'react';
import { useLanguage } from '@/shared/languages';
import { CvAnalysisFlowShell } from '../components/flow/CvAnalysisFlowShell';
import { CvDomainStep } from '../components/flow/CvDomainStep';
import { CvUploadStep } from '../components/flow/CvUploadStep';
import { CvJobDescriptionStep } from '../components/flow/CvJobDescriptionStep';
import { CvAnalysisProgressStep } from '../components/flow/CvAnalysisProgressStep';
import type { CvAnalysisStep } from '../components/CvAnalysisStepper';
import { useCvAnalysisFlow } from '../hooks/useCvAnalysisFlow';

export const CVAnalysisPage: React.FC = () => {
  const { t } = useLanguage();
  const flow = useCvAnalysisFlow();

  const currentStep = useMemo<CvAnalysisStep>(() => {
    if (flow.step === 4) return 'analysis';
    if (flow.step === 3) return 'job-description';
    if (flow.step === 2) return 'upload';
    return 'domain';
  }, [flow.step]);

  return (
    <div className="min-h-full px-6 py-6 sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto mb-8 w-full max-w-[1600px] space-y-3 lg:mb-10">
        <h1 className="heading-primary text-3xl tracking-tight sm:text-4xl">{t('cv.title')}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t('cv.description')}
        </p>
      </div>

      <CvAnalysisFlowShell
        currentStep={currentStep}
        failedStep={flow.parseError ? 'analysis' : undefined}
      >
        {flow.step === 1 ? (
          <CvDomainStep
            domain={flow.domain}
            onSelect={flow.selectDomain}
            onNext={flow.goNext}
          />
        ) : null}

        {flow.step === 2 ? (
          <CvUploadStep
            file={flow.file}
            fileError={flow.fileError}
            onFileSelect={flow.selectFile}
            onNext={flow.goNext}
            onBack={flow.goBack}
          />
        ) : null}

        {flow.step === 3 ? (
          <CvJobDescriptionStep
            jobDescription={flow.jobDescription}
            fileName={flow.file?.name}
            domain={flow.domain}
            onJobDescriptionChange={flow.setJobDescription}
            onBack={flow.goBack}
            onNext={() => void flow.runAnalysis()}
          />
        ) : null}

        {flow.step === 4 ? (
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
