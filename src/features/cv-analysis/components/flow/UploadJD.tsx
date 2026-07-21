import React, { useState } from 'react';
import { useLanguage } from '@/shared/languages';
import type { FileRecord } from '../../types/cvAnalysis.types';
import type { CvAnalysisDomain } from '../../types/cvDomain.types';
import type { FileUploadStatus } from '../../hooks/useCvAnalysisFlow';
import { CvFlowSectionCard } from './CvFlowSectionCard';
import { CvFlowFileSourceTabs, type CvFlowFileSourceTab } from './CvFlowFileSourceTabs';
import { CvFlowUploadedFilesPanel } from './CvFlowUploadedFilesPanel';
import { CvFlowNewPdfUploadPanel } from './CvFlowNewPdfUploadPanel';
import { CvFlowStepActions } from './CvFlowStepActions';

export interface UploadJDProps {
  jdFile: File | null;
  selectedFileId: string | null;
  jdFileError: string | null;
  isUploading?: boolean;
  uploadStatus?: FileUploadStatus;
  fileName?: string;
  domain?: CvAnalysisDomain | null;
  onJdFileSelect: (file: File | null) => void;
  onExistingSelect: (record: FileRecord) => void;
  onBack: () => void;
  onNext: () => void;
}

function resolveInitialTab(file: File | null, selectedFileId: string | null): CvFlowFileSourceTab {
  if (file) return 'new';
  if (selectedFileId) return 'uploaded';
  return 'uploaded';
}

/** Step 3 — pick an uploaded JD or upload a new PDF. */
export const UploadJD: React.FC<UploadJDProps> = ({
  jdFile,
  selectedFileId,
  jdFileError,
  isUploading = false,
  uploadStatus = 'idle',
  fileName,
  domain,
  onJdFileSelect,
  onExistingSelect,
  onBack,
  onNext,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<CvFlowFileSourceTab>(() =>
    resolveInitialTab(jdFile, selectedFileId),
  );

  const isReady = uploadStatus === 'completed' && Boolean(selectedFileId);
  const canNext = isReady && !jdFileError && !isUploading;

  return (
    <CvFlowSectionCard
      title={t('cv.step.jobDescription')}
      description={t('cv.stepDesc.job-description')}
    >
      {fileName || domain ? (
        <div className="mb-4 space-y-2 rounded-xl border border-satin bg-white/[0.04] px-4 py-3 text-sm text-muted-foreground">
          {domain ? (
            <p>
              {t('cv.selectedDomain')}:{' '}
              <span className="font-medium text-foreground">{t(`cv.domain.${domain}.title`)}</span>
            </p>
          ) : null}
          {fileName ? (
            <p>
              {t('cv.attachedFile')}: <span className="font-medium text-foreground">{fileName}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{t('cv.jdTitle')}</span>
        <span className="text-caption rounded-lg border border-satin bg-white/[0.04] px-2.5 py-1">
          {t('cv.required')}
        </span>
      </div>

      <CvFlowFileSourceTabs
        activeTab={activeTab}
        uploadedLabel={t('cv.tab.uploadedJd')}
        newLabel={t('cv.tab.uploadNewJd')}
        onChange={setActiveTab}
        disabled={isUploading}
      />

      <div className="mt-4" role="tabpanel">
        {activeTab === 'uploaded' ? (
          <CvFlowUploadedFilesPanel
            fileType="jd"
            selectedFileId={selectedFileId}
            disabled={isUploading}
            onSelect={onExistingSelect}
          />
        ) : (
          <CvFlowNewPdfUploadPanel
            file={jdFile}
            fileError={jdFileError}
            isUploading={isUploading}
            uploadStatus={uploadStatus}
            dropTitle={t('cv.jdDropTitle')}
            dropDescription={t('cv.jdDropDescription')}
            chooseFileLabel={t('cv.chooseFile')}
            changeFileLabel={t('cv.changeFile')}
            uploadingLabel={t('cv.uploading')}
            uploadCompletedLabel={t('cv.uploadCompleted')}
            onFileSelect={onJdFileSelect}
            minHeightClass="min-h-[180px]"
            showRemove
            removeLabel={t('cv.jdRemoveFile')}
          />
        )}
      </div>

      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li>{t('cv.tipJd')}</li>
        <li>{t('cv.tipJdRequired')}</li>
      </ul>

      <CvFlowStepActions
        canNext={canNext}
        isBusy={isUploading}
        onBack={onBack}
        onNext={onNext}
      />
    </CvFlowSectionCard>
  );
};

/** @deprecated Use UploadJD */
export const CvJobDescriptionStep = UploadJD;
