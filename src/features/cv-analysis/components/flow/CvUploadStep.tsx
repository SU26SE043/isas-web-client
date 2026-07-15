import React from 'react';
import { FileText, Upload } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import { CvFlowSectionCard } from './CvFlowSectionCard';

interface CvUploadStepProps {
  file: File | null;
  fileError: string | null;
  onFileSelect: (file: File | null) => void;
  onNext: () => void;
  onBack?: () => void;
}

export const CvUploadStep: React.FC<CvUploadStepProps> = ({
  file,
  fileError,
  onFileSelect,
  onNext,
  onBack,
}) => {
  const { t } = useLanguage();
  const canNext = Boolean(file) && !fileError;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    onFileSelect(selected);
  };

  return (
    <CvFlowSectionCard title={t('cv.step.upload')} description={t('cv.stepDesc.upload')}>
      <label
        className={cn(
          'group relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl glass-well px-6 py-12 text-center transition-[border-color,background-color,box-shadow] duration-200 ease-out',
          file ? 'border-[var(--satin-border-hover)] bg-white/[0.03] shadow-[var(--satin-inset)]' : null,
        )}
      >
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleChange}
          className="sr-only"
          aria-invalid={fileError ? true : undefined}
        />
        <span className="frame-satin-soft mb-5 flex size-14 items-center justify-center rounded-2xl bg-white/[0.04] text-muted-foreground transition-colors group-hover:text-foreground">
          <Upload className="size-7" aria-hidden />
        </span>
        <p className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {t('cv.dropTitle')}
        </p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t('cv.dropDescription')}
        </p>
        <span className="btn-secondary mt-6 inline-flex rounded-xl px-4 py-2.5 text-sm">
          {t('cv.chooseFile')}
        </span>
      </label>

      {file ? (
        <div className="frame-satin mt-4 flex items-center gap-3 rounded-xl bg-white/[0.04] px-4 py-3">
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

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {onBack ? (
          <button type="button" className="btn-secondary rounded-xl" onClick={onBack}>
            {t('cv.back')}
          </button>
        ) : (
          <span />
        )}
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
          {t('cv.next')}
        </button>
      </div>
    </CvFlowSectionCard>
  );
};
