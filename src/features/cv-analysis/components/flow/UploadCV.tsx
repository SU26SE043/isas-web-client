import React, { useState } from 'react';
import { useLanguage } from '@/shared/languages';
import type { FileRecord } from '../../types/cvAnalysis.types';
import type { FileUploadStatus } from '../../hooks/useCvAnalysisFlow';
import { CvFlowSectionCard } from './CvFlowSectionCard';
import { CvFlowFileSourceTabs, type CvFlowFileSourceTab } from './CvFlowFileSourceTabs';
import { CvFlowUploadedFilesPanel } from './CvFlowUploadedFilesPanel';
import { CvFlowNewPdfUploadPanel } from './CvFlowNewPdfUploadPanel';
import { CvFlowStepActions } from './CvFlowStepActions';

export interface UploadCVProps {
  file: File | null;
  selectedFileId: string | null;
  fileError: string | null;
  isUploading?: boolean;
  uploadStatus?: FileUploadStatus;
  onFileSelect: (file: File | null) => void;
  onExistingSelect: (record: FileRecord) => void;
  onBack: () => void;
  onNext: () => void;
}

function resolveInitialTab(file: File | null, selectedFileId: string | null): CvFlowFileSourceTab {
  if (file) return 'new';
  if (selectedFileId) return 'uploaded';
  return 'new';
}

/**
 * Step 2 — pick or upload the CV. The field is its own step before this one.
 *
 * The upload interaction (tabs, dropzone, progress) is unchanged; redesigning
 * the dropzone is a separate PR.
 */
export const UploadCV: React.FC<UploadCVProps> = ({
  file,
  selectedFileId,
  fileError,
  isUploading = false,
  uploadStatus = 'idle',
  onFileSelect,
  onExistingSelect,
  onBack,
  onNext,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<CvFlowFileSourceTab>(() =>
    resolveInitialTab(file, selectedFileId),
  );

  const isFileReady = uploadStatus === 'completed' && Boolean(selectedFileId);
  const canNext = isFileReady && !fileError && !isUploading;
  const blockedHint = !isFileReady && !isUploading ? t('cv.needCvHint') : null;

  return (
    <CvFlowSectionCard title={t('cv.step.cv')} description={t('cv.stepDesc.cv')}>
      <div className="space-y-7">
        <section aria-labelledby="cv-file-section-label">
          <h3
            id="cv-file-section-label"
            className="mb-3 text-sm font-semibold text-foreground"
          >
            {t('cv.cvSectionTitle')}
          </h3>

          <CvFlowFileSourceTabs
            activeTab={activeTab}
            uploadedLabel={t('cv.tab.uploadedCv')}
            newLabel={t('cv.tab.uploadNewCv')}
            onChange={setActiveTab}
            disabled={isUploading}
          />

          <div className="mt-4" role="tabpanel">
            {activeTab === 'uploaded' ? (
              <CvFlowUploadedFilesPanel
                fileType="cv"
                selectedFileId={selectedFileId}
                disabled={isUploading}
                onSelect={onExistingSelect}
              />
            ) : (
              <CvFlowNewPdfUploadPanel
                file={file}
                fileError={fileError}
                isUploading={isUploading}
                uploadStatus={uploadStatus}
                dropTitle={t('cv.dropTitle')}
                dropDescription={t('cv.dropDescription')}
                chooseFileLabel={t('cv.chooseFile')}
                changeFileLabel={t('cv.changeFile')}
                uploadingLabel={t('cv.uploading')}
                uploadCompletedLabel={t('cv.uploadCompleted')}
                onFileSelect={onFileSelect}
                minHeightClass="min-h-[200px]"
              />
            )}
          </div>
        </section>
      </div>

      {blockedHint ? (
        <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
          {blockedHint}
        </p>
      ) : null}

      <CvFlowStepActions
        canNext={canNext}
        isBusy={isUploading}
        onBack={onBack}
        onNext={onNext}
      />
    </CvFlowSectionCard>
  );
};

/** @deprecated Use UploadCV */
export const CvUploadStep = UploadCV;
