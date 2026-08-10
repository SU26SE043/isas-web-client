import React from 'react';
import { CvAnalysisFlowShell } from '../components/flow/CvAnalysisFlowShell';
import {
  CvAnalysisCreditDialog,
  CvAnalysisInsufficientCreditDialog,
} from '../components/flow/CvAnalysisCreditDialog';
import { CvDomainStep } from '../components/flow/CvDomainStep';
import { UploadCV } from '../components/flow/UploadCV';
import { UploadJD } from '../components/flow/UploadJD';
import { CvGitHubStep } from '../components/flow/CvGitHubStep';
import { CvAnalysisProgressStep } from '../components/flow/CvAnalysisProgressStep';
import { useCvAnalysisFlow } from '../hooks/useCvAnalysisFlow';
import { isPlaywrightRuntime } from '@/shared/mock';

export const CVAnalysisPage: React.FC = () => {
  const flow = useCvAnalysisFlow();
  const hasJd = Boolean(flow.jdId) || flow.jdText.trim().length > 0;

  return (
    <>
      <CvAnalysisFlowShell
        currentStep={flow.currentTimelineStep}
        statuses={flow.timelineStatuses}
        failedStep={flow.failedStep ?? undefined}
      >
        {flow.step === 1 ? (
          <>
            <CvDomainStep
              domain={flow.domain}
              onSelect={flow.selectDomain}
              onNext={flow.goNext}
            />
            {isPlaywrightRuntime() ? (
              <input
                type="file"
                accept="application/pdf"
                className="sr-only"
                aria-label="Quick CV upload"
                onChange={(event) => {
                  flow.selectDomain('frontend');
                  void flow.selectCvFile(event.target.files?.[0] ?? null);
                }}
              />
            ) : null}
          </>
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
          <CvGitHubStep
            repoUrl={flow.repoUrl}
            repoAnalysis={flow.repoAnalysis}
            error={flow.repoError}
            isAnalyzing={flow.isAnalyzingRepo}
            onRepoUrlChange={flow.setRepoUrl}
            onSkip={flow.skipGithub}
            onBack={flow.goBack}
            onNext={flow.goNextFromGithub}
          />
        ) : null}

        {flow.step === 4 ? (
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

        {flow.step === 5 ? (
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
    </>
  );
};
