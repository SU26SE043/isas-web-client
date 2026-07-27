import { CheckCircle2, Download, FileText, RefreshCw } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import type { DeferredJdFileStatus } from '../../../types/campaignWizard.types';
import { CAMPAIGN_PDF_MAX_BYTES } from '../../../utils/campaignFiles';

type CampaignFileUploadedCardProps = {
  file: File | null;
  fileName: string | null;
  fileSize: number | null;
  status: DeferredJdFileStatus;
  progress: number | null;
  isDownloading?: boolean;
  canReplace?: boolean;
  replaceDisabledReason?: string | null;
  displayName: string;
  replaceLabel: string;
  downloadLabel: string;
  downloadingLabel: string;
  replacingLabel: string;
  successLabel: string;
  onDownload?: () => void;
  openPicker: () => void;
};

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function CampaignFileUploadedCard({
  file,
  fileSize,
  status,
  progress,
  isDownloading = false,
  canReplace = true,
  replaceDisabledReason = null,
  displayName,
  replaceLabel,
  downloadLabel,
  downloadingLabel,
  replacingLabel,
  successLabel,
  onDownload,
  openPicker,
}: CampaignFileUploadedCardProps) {
  const displaySize = file?.size ?? fileSize;

  return (
    <div className="frame-satin flex flex-col gap-3 rounded-xl bg-white/[0.04] px-4 py-3 sm:flex-row sm:items-start">
      <FileText className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1 text-left">
        <p className="line-clamp-2 break-words text-sm font-medium text-foreground" title={displayName}>
          {displayName}
        </p>
        <p className="text-caption text-muted-foreground">
          {displaySize != null ? formatSize(displaySize) : null}
          {displaySize != null && displaySize > CAMPAIGN_PDF_MAX_BYTES ? ' · > 10 MB' : null}
        </p>
        {status === 'replacing' && progress != null ? (
          <div className="mt-2">
            <div
              className="h-1.5 overflow-hidden rounded-full bg-surface-overlay"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="h-full rounded-full bg-foreground/70"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{replacingLabel}</p>
          </div>
        ) : null}
        {status === 'uploaded' && !isDownloading ? (
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-success/30 bg-success-bg px-2.5 py-1 text-xs font-medium text-success">
            <CheckCircle2 className="size-3.5" aria-hidden />
            {successLabel}
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <button
          type="button"
          className="btn-secondary inline-flex items-center gap-1.5 text-sm"
          disabled={isDownloading || status === 'replacing'}
          title={downloadLabel}
          onClick={() => onDownload?.()}
        >
          {isDownloading ? (
            <Spinner className="size-3.5 border-muted border-t-foreground" label={downloadingLabel} />
          ) : (
            <Download className="size-3.5" aria-hidden />
          )}
          {isDownloading ? downloadingLabel : downloadLabel}
        </button>
        <button
          type="button"
          className="btn-secondary inline-flex items-center gap-1.5 text-sm"
          disabled={!canReplace || status === 'replacing' || isDownloading}
          title={!canReplace ? replaceDisabledReason ?? replaceLabel : replaceLabel}
          onClick={openPicker}
        >
          {status === 'replacing' ? (
            <Spinner className="size-3.5 border-muted border-t-foreground" label={replacingLabel} />
          ) : (
            <RefreshCw className="size-3.5" aria-hidden />
          )}
          {status === 'replacing' ? replacingLabel : replaceLabel}
        </button>
      </div>
    </div>
  );
}
