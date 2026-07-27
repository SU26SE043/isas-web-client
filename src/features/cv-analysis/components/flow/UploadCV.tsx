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
  onNext: () => void;
  onBack?: () => void;
}

function resolveInitialTab(file: File | null, selectedFileId: string | null): CvFlowFileSourceTab {
  if (file) return 'new';
  if (selectedFileId) return 'uploaded';
  return 'uploaded';
}

/** Step 2 — pick an uploaded CV or upload a new PDF. */
export const UploadCV: React.FC<UploadCVProps> = ({
  file,
  selectedFileId,
  fileError,
  isUploading = false,
  uploadStatus = 'idle',
  onFileSelect,
  onExistingSelect,
  onNext,
  onBack,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<CvFlowFileSourceTab>(() =>
    resolveInitialTab(file, selectedFileId),
  );

  const isReady = uploadStatus === 'completed' && Boolean(selectedFileId);
  const canNext = isReady && !fileError && !isUploading;

  return (
    <CvFlowSectionCard title={t('cv.step.upload')} description={t('cv.stepDesc.upload')}>
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
          />
        )}
      </div>

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
