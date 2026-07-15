import React from 'react';
import { useLanguage } from '@/shared/languages';
import { CvAnalysisFlowShell } from '../components/flow/CvAnalysisFlowShell';
import { CvDomainStep } from '../components/flow/CvDomainStep';
import { UploadCV } from '../components/flow/UploadCV';
import { UploadJD } from '../components/flow/UploadJD';
import { CvAnalysisProgressStep } from '../components/flow/CvAnalysisProgressStep';
import { useCvAnalysisFlow } from '../hooks/useCvAnalysisFlow';

export const CVAnalysisPage: React.FC = () => {
  const { t } = useLanguage();
  const flow = useCvAnalysisFlow();

  return (
    <div className="min-h-full px-6 py-6 sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto mb-8 w-full max-w-[1600px] space-y-3 lg:mb-10">
        <h1 className="heading-primary text-3xl tracking-tight sm:text-4xl">{t('cv.title')}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t('cv.description')}
        </p>
      </div>

      <CvAnalysisFlowShell
        currentStep={flow.currentTimelineStep}
        statuses={flow.timelineStatuses}
        failedStep={flow.failedStep ?? undefined}
      >
        {flow.step === 1 ? (
          <CvDomainStep
            domain={flow.domain}
            onSelect={flow.selectDomain}
            onNext={flow.goNext}
          />
        ) : null}

        {flow.step === 2 ? (
          <UploadCV
            file={flow.cvFile}
            fileError={flow.fileError}
            isUploading={flow.isUploading}
            onFileSelect={flow.selectCvFile}
            onNext={() => void flow.goNextFromUpload()}
            onBack={flow.goBack}
          />
        ) : null}

        {flow.step === 3 ? (
          <UploadJD
            jdFile={flow.jdFile}
            jdFileError={flow.jdFileError}
            isUploading={flow.isUploading}
            fileName={flow.cvFile?.name}
            domain={flow.domain}
            onJdFileSelect={flow.selectJdFile}
            onBack={flow.goBack}
            onNext={() => void flow.goNextFromJd()}
          />
        ) : null}

        {flow.step === 4 ? (
          <CvAnalysisProgressStep
            parseProgress={flow.parseProgress}
            isAnalyzing={flow.isAnalyzing}
            parseError={flow.analyzeError}
            fileName={flow.cvFile?.name}
            jdFileName={flow.jdFile?.name}
            domain={flow.domain}
            hasJd={Boolean(flow.jdId)}
            onAnalyze={() => void flow.runAnalysis()}
            onBack={flow.goBack}
            onRetryUpload={flow.analyzeError ? flow.retryFromUpload : undefined}
          />
        ) : null}
      </CvAnalysisFlowShell>
    </div>
  );
};
