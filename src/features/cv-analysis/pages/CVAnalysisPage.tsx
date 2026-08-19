import React from 'react';
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

/**
 * (1) Field → (2) CV → (3) Job → (4) Confirm → (5) Analysing → (6) Report.
 * Steps 4 and 5 render the same component in its two states.
 */
export const CVAnalysisPage: React.FC = () => {
  const flow = useCvAnalysisFlow();
  const workspace = flow.jdWorkspace;
  const cvFileName = flow.cvRecord?.originalName ?? flow.cvFile?.name;
  // There is exactly one JD; a file is just how it was filled in (J1).
  const jdFileName =
    workspace.source.kind === 'file' && !workspace.source.detached
      ? workspace.source.fileName
      : null;

  return (
    <>
      <CvAnalysisFlowShell
        currentStep={flow.currentTimelineStep}
        statuses={flow.timelineStatuses}
        failedStep={flow.failedStep ?? undefined}
      >
        {flow.step === 1 ? (
          <CvDomainStep
            domain={flow.domain}
            onSelect={flow.selectDomain}
            onNext={flow.goNextFromDomain}
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
            onBack={flow.goBack}
            onNext={flow.goNextFromCv}
          />
        ) : null}

        {flow.step === 3 ? (
          <UploadJD
            workspace={workspace}
            domain={flow.domain}
            cvFileName={cvFileName}
            onBack={flow.goBack}
            onNext={flow.goNextFromJd}
          />
        ) : null}

        {flow.step === 4 || flow.step === 5 ? (
          <CvAnalysisProgressStep
            parseProgress={flow.parseProgress}
            isAnalyzing={flow.isAnalyzing}
            parseError={flow.analyzeError}
            fileName={cvFileName}
            jdFileName={jdFileName}
            domain={flow.domain}
            hasJd={workspace.hasJd}
            requirementCount={flow.requirementCount}
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
