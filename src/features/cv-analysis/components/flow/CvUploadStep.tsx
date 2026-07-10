import React from 'react';
import { FileText, Upload } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { CvFlowSectionCard } from './CvFlowSectionCard';

interface CvUploadStepProps {
  file: File | null;
  fileError: string | null;
  onFileSelect: (file: File | null) => void;
  onNext: () => void;
}

export const CvUploadStep: React.FC<CvUploadStepProps> = ({
  file,
  fileError,
  onFileSelect,
  onNext,
}) => {
  const { t } = useLanguage();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    onFileSelect(selected);
  };

  return (
    <CvFlowSectionCard title={t('cv.step.upload')} description={t('cv.stepDesc.upload')}>
      <label
        className="relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-default bg-surface-overlay/30 px-6 py-10 text-center transition-colors hover:border-subtle hover:bg-surface-overlay/50"
      >
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleChange}
          className="sr-only"
          aria-invalid={fileError ? true : undefined}
        />
        <Upload className="mb-4 size-10 text-muted-foreground" aria-hidden />
        <p className="text-base font-semibold text-foreground">{t('cv.dropTitle')}</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{t('cv.dropDescription')}</p>
        <span className="btn-secondary mt-5 inline-flex text-sm">{t('cv.chooseFile')}</span>
      </label>

      {file ? (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-subtle bg-surface-overlay px-4 py-3">
          <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-caption text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      ) : null}

      {fileError ? (
        <p className="mt-3 text-sm text-error" role="alert">
          {fileError}
        </p>
      ) : null}

      <div className="mt-6 flex justify-end">
        <button type="button" className="btn-primary" disabled={!file || Boolean(fileError)} onClick={onNext}>
          {t('cv.next')}
        </button>
      </div>
    </CvFlowSectionCard>
  );
};
