import React, { useRef } from 'react';
import { FileText, Loader2, Upload } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { validateCvFile } from '@/features/cv-analysis/utils/cvFileValidation';
import type { UploadedCvFile } from '@/features/cv-analysis/types/cvAnalysis.types';
import { PracticeWizardNav } from './PracticeWizardNav';

interface PracticeCvStepProps {
  files: UploadedCvFile[];
  selectedId: string;
  isLoading: boolean;
  isUploading: boolean;
  uploadError: string | null;
  onSelect: (fileId: string) => void;
  onUpload: (file: File) => void;
  onBack: () => void;
  onNext: () => void;
}

export const PracticeCvStep: React.FC<PracticeCvStepProps> = ({
  files,
  selectedId,
  isLoading,
  isUploading,
  uploadError,
  onSelect,
  onUpload,
  onBack,
  onNext,
}) => {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateCvFile(file);
    if (validation === 'invalidType') {
      setLocalError(t('cv.invalidType'));
      return;
    }
    if (validation === 'invalidSize') {
      setLocalError(t('cv.invalidSize'));
      return;
    }

    setLocalError(null);
    onUpload(file);
    event.target.value = '';
  };

  const errorMessage = uploadError ?? localError;

  return (
    <section className="rounded-xl border border-subtle bg-surface-raised p-6">
      <h2 className="heading-secondary text-lg">{t('practice.wizard.cv.title')}</h2>
      <p className="body-text mt-1 text-sm">{t('practice.wizard.cv.description')}</p>

      <label className="mt-5 flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-default bg-surface-overlay/30 px-6 py-8 text-center transition hover:border-subtle">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          className="sr-only"
          disabled={isUploading}
        />
        {isUploading ? (
          <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        ) : (
          <Upload className="size-8 text-muted-foreground" aria-hidden />
        )}
        <p className="mt-3 text-sm font-medium text-foreground">{t('practice.wizard.cv.upload')}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t('practice.wizard.cv.uploadHint')}</p>
      </label>

      {errorMessage ? (
        <p className="mt-3 text-sm text-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <div className="mt-5 flex justify-center py-6">
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
        </div>
      ) : files.length > 0 ? (
        <ul className="mt-5 space-y-2">
          {files.map((file) => {
            const isSelected = file.id === selectedId;
            return (
              <li key={file.id}>
                <button
                  type="button"
                  onClick={() => onSelect(file.id)}
                  className={[
                    'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition',
                    isSelected
                      ? 'border-default bg-surface-elevated'
                      : 'border-subtle bg-surface-overlay hover:border-default',
                  ].join(' ')}
                  aria-pressed={isSelected}
                >
                  <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{file.fileName}</p>
                    <p className="text-caption text-muted-foreground">
                      {(file.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">{t('practice.wizard.cv.empty')}</p>
      )}

      <PracticeWizardNav
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!selectedId || isUploading}
      />
    </section>
  );
};
