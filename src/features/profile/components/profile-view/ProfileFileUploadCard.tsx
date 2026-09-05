import { useCallback, useRef, useState } from 'react';
import { CloudUpload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { cvAnalysisService } from '@/features/cv-analysis/services/cvAnalysis.service';
import { validateCvFile } from '@/features/cv-analysis/utils/cvFileValidation';
import { useLanguage } from '@/shared/languages';
import type { InterviewFileType } from '@/features/cv-analysis/types/cvAnalysis.types';
import { resolveCvFileActionError } from './resolveCvFileActionError';

interface ProfileFileUploadCardProps {
  disabled?: boolean;
  isUploading?: boolean;
  onUploaded: () => Promise<void>;
}

export function ProfileFileUploadCard({
  disabled = false,
  isUploading: isUploadingProp = false,
  onUploaded,
}: ProfileFileUploadCardProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileType, setFileType] = useState<InterviewFileType>('cv');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const busy = disabled || isUploading || isUploadingProp;

  const uploadFile = useCallback(
    async (file: File) => {
      const validation = validateCvFile(file);
      if (validation === 'invalidType') {
        toast.error(t('cv.invalidType'));
        return;
      }
      if (validation === 'invalidSize') {
        toast.error(t('cv.invalidSize'));
        return;
      }

      setIsUploading(true);
      try {
        if (fileType === 'cv') {
          await cvAnalysisService.uploadCv(file);
          toast.success(t('cv.uploadCvSuccess'));
        } else {
          await cvAnalysisService.uploadJd(file);
          toast.success(t('cv.uploadJdSuccess'));
        }
        await onUploaded();
      } catch (err) {
        toast.error(
          resolveCvFileActionError(err, t, 'cv.error.uploadFailed'),
        );
      } finally {
        setIsUploading(false);
      }
    },
    [fileType, onUploaded, t],
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    event.target.value = '';
    if (selected) void uploadFile(selected);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (busy) return;
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) void uploadFile(dropped);
  };

  return (
    <article
      className={cn(
        'flex h-full min-h-[220px] flex-col rounded-lg border border-dashed border-satin bg-surface-overlay p-4 transition-colors',
        isDragging && 'border-[var(--satin-border-hover)] bg-surface-overlay',
        busy && 'pointer-events-none opacity-70',
      )}
      onDragOver={(event) => {
        event.preventDefault();
        if (!busy) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="frame-satin-soft mb-4 flex size-12 items-center justify-center rounded-xl bg-white/[0.04] text-muted-foreground">
          {isUploading ? (
            <Spinner className="size-6 border-muted border-t-foreground" label={t('cv.uploading')} />
          ) : (
            <CloudUpload className="size-6" aria-hidden />
          )}
        </span>
        <p className="text-sm font-medium text-foreground">
          {t('profile.view.uploadNewFile')}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('profile.view.uploadDragHint')}
        </p>

        <label className="mt-4 block w-full max-w-[180px] text-left">
          <span className="text-label mb-1.5 block text-muted-foreground">
            {t('profile.view.uploadFileType')}
          </span>
          <select
            className="w-full rounded-lg border border-default bg-surface-base px-3 py-2 text-sm text-foreground"
            value={fileType}
            disabled={busy}
            onChange={(event) => setFileType(event.target.value as InterviewFileType)}
            aria-label={t('profile.view.uploadFileType')}
          >
            <option value="cv">{t('profile.view.fileTypeCv')}</option>
            <option value="jd">{t('profile.view.fileTypeJd')}</option>
          </select>
        </label>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-4"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {t('profile.view.chooseFile')}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
        className="sr-only"
        disabled={busy}
        onChange={handleFileChange}
      />
    </article>
  );
}
