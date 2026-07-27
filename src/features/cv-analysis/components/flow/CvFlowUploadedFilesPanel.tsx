import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useInterviewFiles } from '@/features/cv-analysis/hooks/useInterviewFiles';
import type { FileRecord, InterviewFileType } from '@/features/cv-analysis/types/cvAnalysis.types';
import { useLanguage } from '@/shared/languages';
import { CvFlowSelectFileCard } from './CvFlowSelectFileCard';

interface CvFlowUploadedFilesPanelProps {
  fileType: InterviewFileType;
  selectedFileId: string | null;
  disabled?: boolean;
  onSelect: (file: FileRecord) => void;
}

export function CvFlowUploadedFilesPanel({
  fileType,
  selectedFileId,
  disabled = false,
  onSelect,
}: CvFlowUploadedFilesPanelProps) {
  const { t } = useLanguage();
  const { files, isLoading, error, reload } = useInterviewFiles();

  const filteredFiles = files.filter(
    (file) => String(file.fileType).toLowerCase() === fileType,
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-subtle bg-surface-overlay px-4 py-8 text-center">
        <AlertCircle className="size-8 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">{t('cv.uploadedFilesLoadError')}</p>
        <Button type="button" variant="secondary" size="sm" onClick={() => void reload()}>
          {t('cv.uploadedFilesRetry')}
        </Button>
      </div>
    );
  }

  if (filteredFiles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-subtle bg-surface-overlay px-4 py-8 text-center">
        <p className="text-sm font-medium text-foreground">
          {fileType === 'cv' ? t('cv.uploadedCvEmpty') : t('cv.uploadedJdEmpty')}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('cv.uploadedFilesEmptyHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {filteredFiles.map((file) => (
        <CvFlowSelectFileCard
          key={file.id}
          file={file}
          isSelected={selectedFileId === file.id}
          disabled={disabled}
          onSelect={() => onSelect(file)}
        />
      ))}
    </div>
  );
}
