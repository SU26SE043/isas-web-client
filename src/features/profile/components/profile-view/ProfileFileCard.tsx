import { Download, FileText, RefreshCw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FileRecord } from '@/features/cv-analysis/types/cvAnalysis.types';
import { useLanguage } from '@/shared/languages';
import {
  formatProfileFileDate,
  formatProfileFileSize,
  isCvFileType,
  isJdFileType,
} from './profileFileUtils';

export type ProfileFileCardAction = 'download' | 'replace' | 'delete';

interface ProfileFileCardProps {
  file: FileRecord;
  isSelected: boolean;
  activeAction: ProfileFileCardAction | null;
  isSelectionDisabled?: boolean;
  isCardActionsDisabled?: boolean;
  onToggleSelected: () => void;
  onDownload: () => void;
  onReplace: () => void;
  onDelete: () => void;
}

function parseStatusKey(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === 'completed' || normalized === 'done') return 'profile.view.parseStatus.completed';
  if (normalized === 'failed') return 'profile.view.parseStatus.failed';
  return 'profile.view.parseStatus.pending';
}

export function ProfileFileCard({
  file,
  isSelected,
  activeAction,
  isSelectionDisabled = false,
  isCardActionsDisabled = false,
  onToggleSelected,
  onDownload,
  onReplace,
  onDelete,
}: ProfileFileCardProps) {
  const { t, language } = useLanguage();
  const isBusy = activeAction !== null || isCardActionsDisabled;

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-lg border border-satin bg-surface-overlay p-4 transition-[border-color,background-color] duration-200 ease-out',
        'hover:border-[var(--satin-border-hover)] hover:bg-white/[0.03]',
        isSelected ? 'border-[var(--satin-border-hover)] bg-white/[0.05]' : null,
        isBusy && 'opacity-90',
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <label
          className="mt-0.5 flex size-6 cursor-pointer items-center justify-center rounded-md"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            disabled={isSelectionDisabled}
            onChange={() => onToggleSelected()}
            onClick={(e) => e.stopPropagation()}
            aria-label={t('profile.view.selectFileCheckboxAria').replace('{name}', file.originalName)}
            className="size-4 rounded-sm border-satin bg-surface-base accent-white"
          />
        </label>

        <span className="frame-satin-soft flex size-10 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-foreground">
          <FileText className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {isCvFileType(file.fileType) ? (
              <Badge variant="outline" className="border-satin bg-white/[0.04] text-foreground">
                {t('profile.view.fileTypeCv')}
              </Badge>
            ) : null}
            {isJdFileType(file.fileType) ? (
              <Badge variant="secondary" className="bg-white/[0.08] text-foreground">
                {t('profile.view.fileTypeJd')}
              </Badge>
            ) : null}
            <Badge variant="ghost" className="text-muted-foreground">
              {t(parseStatusKey(file.parsedStatus))}
            </Badge>
          </div>
          <p className="truncate text-sm font-medium text-foreground" title={file.originalName}>
            {file.originalName}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('profile.view.fileUploadedAt').replace(
              '{date}',
              formatProfileFileDate(file.createdAt, language),
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatProfileFileSize(file.fileSize)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-subtle pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 border-satin bg-transparent sm:flex-none"
          disabled={isBusy}
          loading={activeAction === 'download'}
          onClick={onDownload}
        >
          <Download className="size-3.5" aria-hidden />
          {t('profile.view.fileDownload')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="flex-1 sm:flex-none"
          disabled={isBusy}
          loading={activeAction === 'replace'}
          onClick={onReplace}
        >
          <RefreshCw className="size-3.5" aria-hidden />
          {t('profile.view.fileReplace')}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="flex-1 sm:flex-none"
          disabled={isBusy}
          loading={activeAction === 'delete'}
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" aria-hidden />
          {t('profile.view.fileDelete')}
        </Button>
      </div>
    </article>
  );
}
