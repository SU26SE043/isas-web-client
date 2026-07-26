import { useRef, useState } from 'react';
import { FileText, Upload } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { DeferredJdFileStatus } from '../../../types/campaignWizard.types';
import { CampaignFileUploadedCard } from './CampaignFileUploadedCard';

interface CampaignFilePanelProps {
  file: File | null;
  fileName: string | null;
  fileSize: number | null;
  status: DeferredJdFileStatus;
  progress: number | null;
  error: string | null;
  isDownloading?: boolean;
  canReplace?: boolean;
  replaceDisabledReason?: string | null;
  dropTitle: string;
  dropSecondary: string;
  chooseFileLabel: string;
  replaceLabel: string;
  downloadLabel: string;
  downloadingLabel: string;
  uploadingLabel: string;
  replacingLabel: string;
  successLabel: string;
  failureLabel: string;
  retryLabel: string;
  chooseOtherLabel: string;
  supportLabel: string;
  onFileSelect: (file: File | null) => void;
  onRetry?: () => void;
  onDownload?: () => void;
  disabled?: boolean;
}

/** Shared PDF dropzone + file card for JD / Criteria campaign files. */
export function CampaignFilePanel(props: CampaignFilePanelProps) {
  const {
    file,
    fileName,
    status,
    error,
    isDownloading = false,
    canReplace = true,
    dropTitle,
    dropSecondary,
    chooseFileLabel,
    uploadingLabel,
    failureLabel,
    retryLabel,
    chooseOtherLabel,
    supportLabel,
    onFileSelect,
    onRetry,
    disabled = false,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const hasFile = Boolean(file || fileName);
  const busy = disabled || status === 'uploading' || status === 'replacing' || isDownloading;
  const pickBusy = busy || (hasFile && status === 'uploaded' && !canReplace);
  const displayName = file?.name ?? fileName;
  const showUploadedCard =
    hasFile && (status === 'uploaded' || status === 'replacing' || isDownloading);

  const pick = (next: File | null) => {
    if (pickBusy && next != null) return;
    onFileSelect(next);
    if (inputRef.current) inputRef.current.value = '';
  };

  const openPicker = () => {
    if (pickBusy) return;
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        disabled={pickBusy}
        aria-invalid={error ? true : undefined}
        onChange={(e) => pick(e.target.files?.[0] ?? null)}
      />

      {!showUploadedCard ? (
        <div
          role="button"
          tabIndex={busy ? -1 : 0}
          aria-disabled={busy}
          className={cn(
            'group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl glass-well px-6 py-10 text-center',
            dragging && 'border-[var(--satin-border-hover)] bg-white/[0.05]',
            busy && 'pointer-events-none opacity-70',
          )}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker();
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
          <span className="frame-satin-soft mb-4 flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] text-muted-foreground">
            {status === 'uploading' ? (
              <Spinner className="size-6 border-muted border-t-foreground" label={uploadingLabel} />
            ) : (
              <Upload className="size-6" aria-hidden />
            )}
          </span>
          <p className="text-base font-semibold text-foreground">
            {status === 'uploading' ? uploadingLabel : dropTitle}
          </p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{dropSecondary}</p>
          <span className="btn-secondary mt-5 inline-flex rounded-xl px-4 py-2.5 text-sm">
            {chooseFileLabel}
          </span>
          <p className="mt-3 text-xs text-muted-foreground">{supportLabel}</p>
        </div>
      ) : null}

      {showUploadedCard && displayName ? (
        <CampaignFileUploadedCard {...props} displayName={displayName} openPicker={openPicker} />
      ) : null}

      {hasFile && !showUploadedCard ? (
        <div className="frame-satin flex items-start gap-3 rounded-xl bg-white/[0.04] px-4 py-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{displayName}</p>
            {status === 'uploading' ? (
              <p className="mt-1 text-xs text-muted-foreground">{uploadingLabel}</p>
            ) : null}
            {status === 'failed' ? (
              <span className="mt-1 inline-flex rounded-md border border-error/30 bg-error-bg px-2.5 py-1 text-xs text-error">
                {failureLabel}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-error" role="alert">
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
          <button type="button" className="btn-ghost text-sm" onClick={openPicker}>
            {chooseOtherLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export { validateCampaignPdf as validateCampaignJdPdf } from '../../../utils/campaignFiles';
