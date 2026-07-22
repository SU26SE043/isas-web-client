import React from 'react';
import { useLanguage } from '@/shared/languages';
import { CvAnalysisFlowShell } from '../components/flow/CvAnalysisFlowShell';
import {
  CvAnalysisCreditDialog,
  CvAnalysisInsufficientCreditDialog,
} from '../components/flow/CvAnalysisCreditDialog';
import { CvDomainStep } from '../components/flow/CvDomainStep';
import { UploadCV } from '../components/flow/UploadCV';
import { UploadJD } from '../components/flow/UploadJD';
import { CvAnalysisProgressStep } from '../components/flow/CvAnalysisProgressStep';
import { useCvAnalysisFlow } from '../hooks/useCvAnalysisFlow';

export const CVAnalysisPage: React.FC = () => {
  const { t } = useLanguage();
  const flow = useCvAnalysisFlow();
  const hasJd = Boolean(flow.jdId) || flow.jdText.trim().length > 0;

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
            selectedFileId={flow.cvId}
            fileError={flow.fileError}
            isUploading={flow.isUploading}
            uploadStatus={flow.cvUploadStatus}
            onFileSelect={(file) => void flow.selectCvFile(file)}
            onExistingSelect={flow.selectExistingCv}
            onNext={flow.goNextFromUpload}
            onBack={flow.goBack}
          />
        ) : null}

        {flow.step === 3 ? (
          <UploadJD
            jdFile={flow.jdFile}
            selectedFileId={flow.jdId}
            jdFileError={flow.jdFileError}
            jdText={flow.jdText}
            isUploading={flow.isUploading}
            uploadStatus={flow.jdUploadStatus}
            fileName={flow.cvRecord?.originalName ?? flow.cvFile?.name}
            domain={flow.domain}
            onJdFileSelect={(file) => void flow.selectJdFile(file)}
            onExistingSelect={flow.selectExistingJd}
            onJdTextChange={flow.setJdText}
            onSkip={flow.skipJd}
            onBack={flow.goBack}
            onNext={flow.goNextFromJd}
          />
        ) : null}

        {flow.step === 4 ? (
          <CvAnalysisProgressStep
            parseProgress={flow.parseProgress}
            isAnalyzing={flow.isAnalyzing}
            parseError={flow.analyzeError}
            fileName={flow.cvRecord?.originalName ?? flow.cvFile?.name}
            jdFileName={flow.jdRecord?.originalName ?? flow.jdFile?.name}
            domain={flow.domain}
            hasJd={hasJd}
            onAnalyze={flow.runAnalysis}
            onBack={flow.goBack}
            onRetryUpload={flow.analyzeError ? flow.retryFromUpload : undefined}
          />
        ) : null}
      </CvAnalysisFlowShell>

      <CvAnalysisCreditDialog
        open={flow.creditDialogOpen}
        onOpenChange={flow.setCreditDialogOpen}
        onConfirm={flow.confirmAnalysis}
        isSubmitting={flow.isAnalyzing}
      />
      <CvAnalysisInsufficientCreditDialog
        open={flow.insufficientCreditOpen}
        onOpenChange={flow.setInsufficientCreditOpen}
      />
    </div>
  );
};
