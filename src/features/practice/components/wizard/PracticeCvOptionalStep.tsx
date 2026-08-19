import { useRef, useState } from 'react';
import { FileText, RefreshCw, Upload } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import { validateCvFile } from '@/features/cv-analysis/utils/cvFileValidation';
import type { UploadedCvFile } from '@/features/cv-analysis/types/cvAnalysis.types';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardOptionCard } from './PracticeWizardOptionCard';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

interface PracticeCvOptionalStepProps {
  files: UploadedCvFile[];
  selectedId: string | null;
  isLoading: boolean;
  isUploading: boolean;
  uploadError: string | null;
  loadError?: boolean;
  disabled?: boolean;
  onSelect: (fileId: string | null) => void;
  onUpload: (file: File) => void;
  onRetryLoad?: () => void;
  onBack: () => void;
  onNext: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PracticeCvOptionalStep({
  files,
  selectedId,
  isLoading,
  isUploading,
  uploadError,
  loadError = false,
  disabled,
  onSelect,
  onUpload,
  onRetryLoad,
  onBack,
  onNext,
}: PracticeCvOptionalStepProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

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
    <PracticeWizardStepCard
      icon={<FileText className="size-4" aria-hidden />}
      title={t('practice.setup.cv.title')}
      description={t('practice.setup.cv.description')}
      isLoading={isLoading && files.length === 0}
      footer={
        <PracticeWizardNav onBack={onBack} onNext={onNext} nextDisabled={isUploading || disabled} />
      }
    >
      <label
        className={cn(
          'glass-well group relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl px-6 py-8 text-center',
          isUploading || disabled ? 'pointer-events-none opacity-70' : null,
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf"
          onChange={handleFileChange}
          className="sr-only"
          disabled={isUploading || disabled}
        />
        <Upload className="mb-3 size-5 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium text-foreground">
          {isUploading ? t('practice.wizard.loading') : t('practice.setup.cv.upload')}
        </p>
      </label>

      {errorMessage ? (
        <p className="mt-3 text-sm text-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {loadError ? (
        <div className="mt-4 rounded-2xl border border-error/30 bg-error/10 p-4 text-center" role="alert">
          <p className="text-sm font-medium text-error">{t('practice.setup.cv.loadError')}</p>
          {onRetryLoad ? (
            <button
              type="button"
              className="btn-secondary mt-3 inline-flex items-center gap-2"
              onClick={onRetryLoad}
              disabled={isLoading || disabled}
            >
              <RefreshCw className="size-4" aria-hidden />
              {t('practice.setup.cv.retry')}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        <PracticeWizardOptionCard
          title={t('practice.setup.cv.noCv')}
          description={t('practice.setup.cv.noCvHint')}
          selected={selectedId === null}
          onClick={() => onSelect(null)}
          disabled={disabled}
        />
        {files.map((file) => (
          <PracticeWizardOptionCard
            key={file.id}
            title={file.fileName}
            description={`${formatBytes(file.fileSizeBytes)} · ${new Date(file.uploadedAt).toLocaleDateString()}`}
            selected={selectedId === file.id}
            onClick={() => onSelect(file.id)}
            disabled={disabled}
          />
        ))}
      </div>
    </PracticeWizardStepCard>
  );
}
