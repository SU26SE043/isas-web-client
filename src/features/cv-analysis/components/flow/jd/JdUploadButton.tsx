import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { cvAnalysisService } from '@/features/cv-analysis/services/cvAnalysis.service';
import { INTERVIEW_FILES_QUERY_KEY } from '@/features/cv-analysis/hooks/useInterviewFiles';
import { validatePdfFile } from '@/features/cv-analysis/utils/cvFileValidation';
import { resolveJdError } from '@/features/cv-analysis/utils/resolveJdError';
import { useLanguage } from '@/shared/languages';

export interface JdUploadButtonProps {
  disabled?: boolean;
  /** Called with the stored file so the workspace can pull its parsed text in. */
  onUploaded: (file: { id: string; name: string }) => void;
  onError: (message: string | null) => void;
}

/**
 * Upload a JD PDF, then hand the record to the workspace.
 * The file is a *way to fill the textarea*, never a second JD object (J1).
 */
export function JdUploadButton({ disabled = false, onUploaded, onError }: JdUploadButtonProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const handleFile = async (file: File | null) => {
    if (!file) return;
    onError(null);
    const validation = validatePdfFile(file);
    if (validation !== 'ok') {
      onError(validation === 'invalidType' ? t('cv.jdInvalidType') : t('cv.jdInvalidSize'));
      return;
    }
    setIsUploading(true);
    try {
      const record = await cvAnalysisService.uploadJd(file);
      await queryClient.invalidateQueries({ queryKey: INTERVIEW_FILES_QUERY_KEY });
      onUploaded({ id: record.id, name: record.originalName || file.name });
    } catch (error) {
      onError(resolveJdError(error, 'uploadJd', t).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        // The visible Button below is the control; without this the hidden
        // input is a second tab stop with the same name and no focus ring.
        tabIndex={-1}
        aria-label={t('cv.jd.source.upload')}
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          event.target.value = '';
          void handleFile(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="min-h-11"
        disabled={disabled || isUploading}
        loading={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? null : <Upload aria-hidden />}
        {isUploading ? t('cv.jd.source.uploading') : t('cv.jd.source.upload')}
      </Button>
    </>
  );
}
