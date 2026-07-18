import { useRef, useState } from 'react';
import { CheckCircle2, FileText, Upload } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export type DeferredJdFileStatus = 'idle' | 'selected' | 'uploading' | 'uploaded' | 'failed';

interface JobDescriptionFilePanelProps {
  file: File | null;
  fileName: string | null;
  fileSize: number | null;
  status: DeferredJdFileStatus;
  progress: number | null;
  error: string | null;
  dropTitle: string;
  dropSecondary: string;
  chooseFileLabel: string;
  changeFileLabel: string;
  removeLabel: string;
  pendingLabel: string;
  uploadingLabel: string;
  successLabel: string;
  failureLabel: string;
  retryLabel: string;
  chooseOtherLabel: string;
  supportLabel: string;
  onFileSelect: (file: File | null) => void;
  onRetry?: () => void;
  disabled?: boolean;
}

const MAX_BYTES = 10 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function JobDescriptionFilePanel({
  file,
  fileName,
  fileSize,
  status,
  progress,
  error,
  dropTitle,
  dropSecondary,
  chooseFileLabel,
  changeFileLabel,
  removeLabel,
  pendingLabel,
  uploadingLabel,
  successLabel,
  failureLabel,
  retryLabel,
  chooseOtherLabel,
  supportLabel,
  onFileSelect,
  onRetry,
  disabled = false,
}: JobDescriptionFilePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const busy = disabled || status === 'uploading';
  const displayName = file?.name ?? fileName;
  const displaySize = file?.size ?? fileSize;

  const pick = (next: File | null) => {
    if (busy) return;
    onFileSelect(next);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={busy ? -1 : 0}
        aria-disabled={busy}
        className={cn(
          'group relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl glass-well px-6 py-12 text-center transition-[border-color,background-color,box-shadow] duration-200 ease-out',
          (file || displayName) &&
            'border-[var(--satin-border-hover)] bg-white/[0.03] shadow-[var(--satin-inset)]',
          dragging && 'border-[var(--satin-border-hover)] bg-white/[0.05]',
          busy && 'pointer-events-none opacity-70',
        )}
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (busy) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files?.[0] ?? null);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          disabled={busy}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'campaign-jd-file-error' : 'campaign-jd-file-support'}
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />
        <span className="frame-satin-soft mb-5 flex size-14 items-center justify-center rounded-2xl bg-white/[0.04] text-muted-foreground transition-colors group-hover:text-foreground">
          {status === 'uploading' ? (
            <Spinner className="size-7 border-muted border-t-foreground" label={uploadingLabel} />
          ) : (
            <Upload className="size-7" aria-hidden />
          )}
        </span>
        <p className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {status === 'uploading' ? uploadingLabel : displayName ? changeFileLabel : dropTitle}
        </p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{dropSecondary}</p>
        <span className="btn-secondary mt-6 inline-flex rounded-xl px-4 py-2.5 text-sm">
          {displayName ? changeFileLabel : chooseFileLabel}
        </span>
        <p id="campaign-jd-file-support" className="mt-4 text-xs text-muted-foreground">
          {supportLabel}
        </p>
      </div>

      {displayName ? (
        <div className="frame-satin flex items-start gap-3 rounded-xl bg-white/[0.04] px-4 py-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0 flex-1 text-left">
            <p
              className="line-clamp-2 break-words text-sm font-medium text-foreground"
              title={displayName}
            >
              {displayName}
            </p>
            <p className="text-caption text-muted-foreground">
              {displaySize != null ? formatSize(displaySize) : null}
              {displaySize != null && displaySize > MAX_BYTES ? ' · > 10 MB' : null}
            </p>
            {status === 'uploading' && progress != null ? (
              <div className="mt-2">
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-surface-overlay"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                >
                  <div
                    className="h-full rounded-full bg-foreground/70 transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {uploadingLabel.replace('{percent}', String(progress))}
                </p>
              </div>
            ) : null}
          </div>
          {status === 'selected' ? (
            <span className="shrink-0 rounded-md border border-satin bg-surface-overlay px-2.5 py-1 text-xs text-muted-foreground">
              {pendingLabel}
            </span>
          ) : null}
          {status === 'uploading' ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Spinner className="size-3.5 border-muted border-t-foreground" label={uploadingLabel} />
            </span>
          ) : null}
          {status === 'uploaded' ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-success/30 bg-success-bg px-2.5 py-1 text-xs font-medium text-success">
              <CheckCircle2 className="size-3.5" aria-hidden />
              {successLabel}
            </span>
          ) : null}
          {status === 'failed' ? (
            <span className="shrink-0 rounded-md border border-error/30 bg-error-bg px-2.5 py-1 text-xs font-medium text-error">
              {failureLabel}
            </span>
          ) : null}
          {status !== 'uploading' ? (
            <button
              type="button"
              className="shrink-0 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                pick(null);
              }}
            >
              {removeLabel}
            </button>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p id="campaign-jd-file-error" className="text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}

      {status === 'failed' ? (
        <div className="flex flex-wrap gap-2">
          {onRetry ? (
            <button type="button" className="btn-secondary text-sm" onClick={onRetry}>
              {retryLabel}
            </button>
          ) : null}
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => inputRef.current?.click()}
          >
            {chooseOtherLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function validateCampaignJdPdf(file: File): string | null {
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) return 'notPdf';
  if (file.size > MAX_BYTES) return 'tooLarge';
  if (file.size <= 0) return 'corrupt';
  return null;
}
