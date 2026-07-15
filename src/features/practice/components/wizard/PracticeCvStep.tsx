import React, { useRef } from 'react';
import { FileText, Upload } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import { validateCvFile } from '@/features/cv-analysis/utils/cvFileValidation';
import type { UploadedCvFile } from '@/features/cv-analysis/types/cvAnalysis.types';
import { PracticeWizardNav } from './PracticeWizardNav';
import { PracticeWizardOptionCard } from './PracticeWizardOptionCard';
import { PracticeWizardStepCard } from './PracticeWizardStepCard';

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
    <PracticeWizardStepCard
      icon={<FileText className="size-4" aria-hidden />}
      title={t('practice.wizard.cv.title')}
      description={t('practice.wizard.cv.description')}
      isLoading={isLoading && files.length === 0}
      footer={
        <PracticeWizardNav
          onBack={onBack}
          onNext={onNext}
          nextDisabled={!selectedId || isUploading}
        />
      }
    >
      <label
        className={cn(
          'glass-well group relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl px-6 py-10 text-center transition-[border-color,background-color,box-shadow] duration-200 ease-out',
          isUploading ? 'pointer-events-none opacity-70' : null,
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          className="sr-only"
          disabled={isUploading}
        />
        <span className="frame-satin-soft mb-4 flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] text-muted-foreground transition-colors group-hover:text-foreground">
          <Upload className="size-5" aria-hidden />
        </span>
        <p className="text-sm font-medium text-foreground">
          {isUploading ? t('practice.wizard.loading') : t('practice.wizard.cv.upload')}
        </p>
        <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
          {t('practice.wizard.cv.uploadHint')}
        </p>
        <span className="btn-secondary mt-5 inline-flex rounded-xl px-4 py-2 text-sm">
          {t('practice.wizard.cv.chooseFile')}
        </span>
      </label>

      {errorMessage ? (
        <p className="mt-3 text-sm text-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {files.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {files.map((file) => (
            <PracticeWizardOptionCard
              key={file.id}
              title={file.fileName}
              description={`${(file.fileSizeBytes / 1024 / 1024).toFixed(2)} MB`}
              icon={<FileText className="size-4" aria-hidden />}
              selected={file.id === selectedId}
              onClick={() => onSelect(file.id)}
            />
          ))}
        </div>
      ) : !isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">{t('practice.wizard.cv.empty')}</p>
      ) : null}
    </PracticeWizardStepCard>
  );
};
