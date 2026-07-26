import { Button } from '@/components/ui/button';
import {
  UploadedFilesTable,
  type UploadedFilesTableLabels,
} from '@/components/patterns/UploadedFilesTable';
import { useLanguage } from '@/shared/languages';
import type { PendingCvFile } from './screeningUtils';

interface CvUploadFileQueueProps {
  files: PendingCvFile[];
  onFilesChange: (files: PendingCvFile[]) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  canAnalyze: boolean;
}

export function CvUploadFileQueue({
  files,
  onFilesChange,
  onAnalyze,
  isAnalyzing,
  canAnalyze,
}: CvUploadFileQueueProps) {
  const { t } = useLanguage();
  const rows = files.map((item, index) => ({
    id: fileId(item.file, index),
    name: item.file.name,
    size: item.file.size,
    status: item.errorKey ? ('error' as const) : ('ready' as const),
    statusLabel: item.errorKey
      ? t('employer.campaigns.screening.upload.invalid')
      : t('employer.campaigns.screening.upload.valid'),
  }));
  const labels: UploadedFilesTableLabels = {
    selected: t('employer.campaigns.screening.upload.selected'),
    totalSize: t('employer.campaigns.screening.upload.totalSizeLabel'),
    format: t('employer.campaigns.screening.upload.format'),
    maxFileSize: t('employer.campaigns.screening.upload.maxFileSize'),
    fileList: t('employer.campaigns.screening.upload.fileList'),
    deleteSelected: t('employer.campaigns.screening.upload.deleteSelected'),
    fileName: t('employer.campaigns.screening.upload.fileName'),
    fileSize: t('employer.campaigns.screening.upload.fileSize'),
    status: t('employer.campaigns.screening.upload.status'),
    actions: t('employer.campaigns.screening.upload.actions'),
    selectPage: t('employer.campaigns.screening.upload.selectPage'),
    preview: t('employer.campaigns.screening.upload.preview'),
    remove: t('employer.campaigns.screening.upload.remove'),
    itemLabel: t('employer.campaigns.screening.upload.itemLabel'),
  };

  const findIndex = (id: string) =>
    files.findIndex((item, index) => fileId(item.file, index) === id);

  return (
    <UploadedFilesTable
      files={rows}
      labels={labels}
      maxFileSize="10 MB"
      disabled={isAnalyzing}
      onRemove={(ids) =>
        onFilesChange(
          files.filter((item, index) => !ids.includes(fileId(item.file, index))),
        )
      }
      onPreview={(id) => {
        const index = findIndex(id);
        if (index < 0) return;
        const url = URL.createObjectURL(files[index].file);
        window.open(url, '_blank', 'noopener,noreferrer');
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }}
      primaryAction={
        <Button
          type="button"
          size="sm"
          disabled={!canAnalyze}
          loading={isAnalyzing}
          onClick={onAnalyze}
        >
          {isAnalyzing
            ? t('employer.campaigns.screening.upload.analyzing')
            : t('employer.campaigns.screening.upload.analyze')}
        </Button>
      }
    />
  );
}

function fileId(file: File, index: number) {
  return `${file.name}-${file.size}-${file.lastModified}-${index}`;
}
