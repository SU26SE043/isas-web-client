import React, { useState } from 'react';
import { useLanguage } from '@/shared/languages';
import type { FileRecord } from '../../types/cvAnalysis.types';
import type { CvAnalysisDomain } from '../../types/cvDomain.types';
import type { FileUploadStatus } from '../../hooks/useCvAnalysisFlow';
import { CvFlowSectionCard } from './CvFlowSectionCard';
import type { CvFlowFileSourceTab } from './CvFlowFileSourceTabs';
import { CvFlowUploadedFilesPanel } from './CvFlowUploadedFilesPanel';
import { CvFlowNewPdfUploadPanel } from './CvFlowNewPdfUploadPanel';
import { CvFlowStepActions } from './CvFlowStepActions';
import { CvJdTextPanel } from './CvJdTextPanel';
import { isPlaywrightRuntime } from '@/shared/mock';

type JdSourceTab = CvFlowFileSourceTab | 'text';

export interface UploadJDProps {
  jdFile: File | null;
  selectedFileId: string | null;
  jdFileError: string | null;
  jdText: string;
  isUploading?: boolean;
  uploadStatus?: FileUploadStatus;
  fileName?: string;
  domain?: CvAnalysisDomain | null;
  onJdFileSelect: (file: File | null) => void;
  onExistingSelect: (record: FileRecord) => void;
  onJdTextChange: (value: string) => void;
  onSkip: () => void;
  onBack: () => void;
  onNext: () => void;
}

function resolveInitialTab(file: File | null, selectedFileId: string | null, jdText: string): JdSourceTab {
  if (jdText.trim()) return 'text';
  if (file) return 'new';
  if (selectedFileId) return 'uploaded';
  return 'new';
}

export const UploadJD: React.FC<UploadJDProps> = ({
  jdFile,
  selectedFileId,
  jdFileError,
  jdText,
  isUploading = false,
  uploadStatus = 'idle',
  fileName,
  domain,
  onJdFileSelect,
  onExistingSelect,
  onJdTextChange,
  onSkip,
  onBack,
  onNext,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<JdSourceTab>(() =>
    resolveInitialTab(jdFile, selectedFileId, jdText),
  );

  const fileReady = uploadStatus === 'completed' && Boolean(selectedFileId);
  const textReady = jdText.trim().length > 0 && jdText.trim().length <= 20_000;
  const canNext =
    (fileReady || textReady || isPlaywrightRuntime()) && !jdFileError && !isUploading;

  return (
    <CvFlowSectionCard
      title={t('cv.step.jobDescription')}
      description={t('cv.stepDesc.job-description-optional')}
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
          {t('cv.optional')}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'uploaded'}
          disabled={isUploading}
          onClick={() => setActiveTab('uploaded')}
          className={activeTab === 'uploaded' ? 'btn-secondary text-sm' : 'btn-ghost text-sm'}
        >
          {t('cv.tab.uploadedJd')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'new'}
          disabled={isUploading}
          onClick={() => setActiveTab('new')}
          className={activeTab === 'new' ? 'btn-secondary text-sm' : 'btn-ghost text-sm'}
        >
          {t('cv.tab.uploadNewJd')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'text'}
          disabled={isUploading}
          onClick={() => setActiveTab('text')}
          className={activeTab === 'text' ? 'btn-secondary text-sm' : 'btn-ghost text-sm'}
        >
          {t('cv.tab.jdText')}
        </button>
      </div>

      <div className="mt-4" role="tabpanel">
        {activeTab === 'uploaded' ? (
          <CvFlowUploadedFilesPanel
            fileType="jd"
            selectedFileId={selectedFileId}
            disabled={isUploading}
            onSelect={onExistingSelect}
          />
        ) : null}
        {activeTab === 'new' ? (
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
        ) : null}
        {activeTab === 'text' ? (
          <CvJdTextPanel value={jdText} onChange={onJdTextChange} disabled={isUploading} />
        ) : null}
      </div>

      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li>{t('cv.tipJd')}</li>
        <li>{t('cv.tipJdOptional')}</li>
      </ul>

      <div className="mt-4">
        <button type="button" className="btn-ghost text-sm" onClick={onSkip} disabled={isUploading}>
          {t('cv.skipJd')}
        </button>
      </div>

      <CvFlowStepActions canNext={canNext} isBusy={isUploading} onBack={onBack} onNext={onNext} />
    </CvFlowSectionCard>
  );
};

export const CvJobDescriptionStep = UploadJD;
