import { CheckCircle2, FileText, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import type { FileUploadStatus } from '../../hooks/useCvAnalysisFlow';

interface CvFlowNewPdfUploadPanelProps {
  file: File | null;
  fileError: string | null;
  isUploading?: boolean;
  uploadStatus?: FileUploadStatus;
  dropTitle: string;
  dropDescription: string;
  chooseFileLabel: string;
  changeFileLabel: string;
  uploadingLabel: string;
  uploadCompletedLabel: string;
  onFileSelect: (file: File | null) => void;
  minHeightClass?: string;
  showRemove?: boolean;
  removeLabel?: string;
}

export function CvFlowNewPdfUploadPanel({
  file,
  fileError,
  isUploading = false,
  uploadStatus = 'idle',
  dropTitle,
  dropDescription,
  chooseFileLabel,
  changeFileLabel,
  uploadingLabel,
  uploadCompletedLabel,
  onFileSelect,
  minHeightClass = 'min-h-[260px]',
  showRemove = false,
  removeLabel,
}: CvFlowNewPdfUploadPanelProps) {
  const isUploaded = uploadStatus === 'completed' && Boolean(file);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    onFileSelect(selected);
    event.target.value = '';
  };

  return (
    <>
      <label
        className={cn(
          'group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl glass-well px-6 py-12 text-center transition-[border-color,background-color,box-shadow] duration-200 ease-out',
          minHeightClass,
          file ? 'border-[var(--satin-border-hover)] bg-white/[0.03] shadow-[var(--satin-inset)]' : null,
          isUploading && 'pointer-events-none opacity-70',
        )}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleChange}
          className="sr-only"
          aria-invalid={fileError ? true : undefined}
          disabled={isUploading}
        />
        <span className="frame-satin-soft mb-5 flex size-14 items-center justify-center rounded-2xl bg-white/[0.04] text-muted-foreground transition-colors group-hover:text-foreground">
          {isUploading ? (
            <Spinner className="size-7 border-muted border-t-foreground" label={uploadingLabel} />
          ) : (
            <Upload className="size-7" aria-hidden />
          )}
        </span>
        <p className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {isUploading ? uploadingLabel : isUploaded ? changeFileLabel : dropTitle}
        </p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {dropDescription}
        </p>
        <span className="btn-secondary mt-6 inline-flex rounded-xl px-4 py-2.5 text-sm">
          {isUploaded ? changeFileLabel : chooseFileLabel}
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
          {isUploading ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Spinner className="size-3.5 border-muted border-t-foreground" label={uploadingLabel} />
              {uploadingLabel}
            </span>
          ) : null}
          {isUploaded ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-success/30 bg-success-bg px-2.5 py-1 text-xs font-medium text-success">
              <CheckCircle2 className="size-3.5" aria-hidden />
              {uploadCompletedLabel}
            </span>
          ) : null}
          {showRemove && !isUploading ? (
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
              onClick={() => onFileSelect(null)}
              aria-label={removeLabel}
            >
              {removeLabel}
            </button>
          ) : null}
        </div>
      ) : null}

      {fileError ? (
        <p className="mt-3 text-sm text-error" role="alert">
          {fileError}
        </p>
      ) : null}
    </>
  );
}
