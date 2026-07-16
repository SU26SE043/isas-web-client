import React from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { CvAnalysisDomain } from '../../types/cvDomain.types';
import { CvFlowSectionCard } from './CvFlowSectionCard';

export interface UploadJDProps {
  jdFile: File | null;
  jdFileError: string | null;
  isUploading?: boolean;
  fileName?: string;
  domain?: CvAnalysisDomain | null;
  onJdFileSelect: (file: File | null) => void;
  onBack: () => void;
  onNext: () => void;
}

/** Step 3 — required POST /files/upload?fileType=jd (PDF ≤10MB). */
export const UploadJD: React.FC<UploadJDProps> = ({
  jdFile,
  jdFileError,
  isUploading = false,
  fileName,
  domain,
  onJdFileSelect,
  onBack,
  onNext,
}) => {
  const { t } = useLanguage();
  const canNext = Boolean(jdFile) && !jdFileError && !isUploading;

  const handleJdFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    onJdFileSelect(selected);
    event.target.value = '';
  };

  return (
    <CvFlowSectionCard title={t('cv.step.jobDescription')} description={t('cv.stepDesc.job-description')}>
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

      <label
        className={cn(
          'group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl glass-well px-6 py-10 text-center transition-[border-color,background-color,box-shadow] duration-200 ease-out',
          jdFile ? 'border-[var(--satin-border-hover)] bg-white/[0.03] shadow-[var(--satin-inset)]' : null,
        )}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleJdFileChange}
          className="sr-only"
          aria-invalid={jdFileError ? true : undefined}
          disabled={isUploading}
        />
        <span className="frame-satin-soft mb-4 flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] text-muted-foreground transition-colors group-hover:text-foreground">
          <Upload className="size-6" aria-hidden />
        </span>
        <p className="text-base font-semibold tracking-tight text-foreground">{t('cv.jdDropTitle')}</p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t('cv.jdDropDescription')}
        </p>
        <span className="btn-secondary mt-5 inline-flex rounded-xl px-4 py-2.5 text-sm">
          {t('cv.chooseFile')}
        </span>
      </label>

      {jdFile ? (
        <div className="frame-satin mt-4 flex items-center gap-3 rounded-xl bg-white/[0.04] px-4 py-3">
          <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium text-foreground">{jdFile.name}</p>
            <p className="text-caption text-muted-foreground">
              {(jdFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
            onClick={() => onJdFileSelect(null)}
            aria-label={t('cv.jdRemoveFile')}
            disabled={isUploading}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}

      {jdFileError ? (
        <p className="mt-3 text-sm text-error" role="alert">
          {jdFileError}
        </p>
      ) : null}

      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li>{t('cv.tipJd')}</li>
        <li>{t('cv.tipJdRequired')}</li>
      </ul>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" className="btn-secondary rounded-xl" onClick={onBack} disabled={isUploading}>
          {t('cv.back')}
        </button>
        <button
          type="button"
          className={cn(
            'inline-flex min-w-[7.5rem] items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-[background-color,border-color,opacity,transform] duration-200 ease-out',
            canNext
              ? 'btn-primary'
              : 'frame-satin cursor-not-allowed bg-white/[0.04] text-muted-foreground opacity-70',
          )}
          disabled={!canNext}
          onClick={onNext}
        >
          {isUploading ? t('cv.uploading') : t('cv.next')}
        </button>
      </div>
    </CvFlowSectionCard>
  );
};

/** @deprecated Use UploadJD */
export const CvJobDescriptionStep = UploadJD;
