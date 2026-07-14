import React, { useRef } from 'react';
import { FileText, Upload } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
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
      <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-8 text-center transition-[border-color,background-color] duration-200 ease-out hover:border-white/25 hover:bg-white/[0.05]">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          className="sr-only"
          disabled={isUploading}
        />
        <span className="flex size-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-foreground">
          <Upload className="size-4" aria-hidden />
        </span>
        <p className="mt-3 text-sm font-medium text-foreground">
          {isUploading ? t('practice.wizard.loading') : t('practice.wizard.cv.upload')}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{t('practice.wizard.cv.uploadHint')}</p>
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
