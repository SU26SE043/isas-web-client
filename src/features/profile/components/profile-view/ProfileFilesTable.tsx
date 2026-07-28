import { useEffect, useRef } from 'react';
import { Download, FileText, RefreshCw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { FileRecord } from '@/features/cv-analysis/types/cvAnalysis.types';
import { useLanguage } from '@/shared/languages';
import type { ProfileFileCardAction } from './profileFileActions.types';
import {
  formatProfileFileDate,
  formatProfileFileSize,
  getProfileFileParseStatusKey,
  isCvFileType,
  isJdFileType,
} from './profileFileUtils';

interface ProfileFilesTableProps {
  files: FileRecord[];
  selectedFileIds: string[];
  isAllSelected: boolean;
  isSomeSelected: boolean;
  activeAction: { fileId: string; action: ProfileFileCardAction } | null;
  isSelectionDisabled: boolean;
  isBulkDeleting: boolean;
  onToggleSelected: (fileId: string) => void;
  onSetSelectedAll: (checked: boolean) => void;
  onDownload: (file: FileRecord) => void;
  onReplace: (file: FileRecord) => void;
  onDelete: (file: FileRecord) => void;
}

export function ProfileFilesTable({
  files,
  selectedFileIds,
  isAllSelected,
  isSomeSelected,
  activeAction,
  isSelectionDisabled,
  isBulkDeleting,
  onToggleSelected,
  onSetSelectedAll,
  onDownload,
  onReplace,
  onDelete,
}: ProfileFilesTableProps) {
  const { t, language } = useLanguage();
  const selectAllRef = useRef<HTMLInputElement>(null);
  const selectedSet = new Set(selectedFileIds);
  const isBusy = isBulkDeleting;

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = isSomeSelected && !isAllSelected;
  }, [isAllSelected, isSomeSelected]);

  if (files.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t('profile.view.filesEmptyTitle')}</p>
    );
  }

  return (
    <Table className="min-w-[880px]">
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <input
              ref={selectAllRef}
              type="checkbox"
              className="size-4 rounded-sm border-satin bg-surface-base accent-white"
              checked={isAllSelected}
              disabled={isSelectionDisabled || isBusy}
              aria-label={t('profile.view.selectAllAria')}
              onChange={(event) => onSetSelectedAll(event.target.checked)}
            />
          </TableHead>
          <TableHead>{t('profile.view.columnFileName')}</TableHead>
          <TableHead>{t('profile.view.columnFileType')}</TableHead>
          <TableHead>{t('profile.view.columnFileSize')}</TableHead>
          <TableHead>{t('profile.view.columnUploadedAt')}</TableHead>
          <TableHead>{t('profile.view.columnStatus')}</TableHead>
          <TableHead className="text-right">{t('profile.table.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => {
          const isCv = isCvFileType(file.fileType);
          const isJd = isJdFileType(file.fileType);
          const rowBusy = isBusy || (activeAction?.fileId === file.id);
          const isSelected = selectedSet.has(file.id);

          return (
            <TableRow key={file.id} data-state={isSelected ? 'selected' : undefined}>
              <TableCell>
                <input
                  type="checkbox"
                  className="size-4 rounded-sm border-satin bg-surface-base accent-white"
                  checked={isSelected}
                  disabled={isSelectionDisabled || isBusy}
                  aria-label={t('profile.view.selectFileCheckboxAria').replace('{name}', file.originalName)}
                  onChange={() => onToggleSelected(file.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      'grid size-8 shrink-0 place-items-center rounded-lg',
                      isCv && 'bg-error/10 text-error',
                      isJd && 'bg-info/10 text-info',
                      !isCv && !isJd && 'bg-white/[0.06] text-foreground',
                    )}
                  >
                    <FileText className="size-4" aria-hidden />
                  </span>
                  <p className="max-w-[280px] truncate font-medium text-foreground" title={file.originalName}>
                    {file.originalName}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                {isCv ? (
                  <Badge variant="outline" className="border-error/30 bg-error/10 text-error">
                    {t('profile.view.fileTypeCv')}
                  </Badge>
                ) : null}
                {isJd ? (
                  <Badge variant="outline" className="border-info/30 bg-info/10 text-info">
                    {t('profile.view.fileTypeJd')}
                  </Badge>
                ) : null}
                {!isCv && !isJd ? '—' : null}
              </TableCell>
              <TableCell>{formatProfileFileSize(file.fileSize)}</TableCell>
              <TableCell className="text-sm">
                {formatProfileFileDate(file.createdAt, language)}
              </TableCell>
              <TableCell>
                <Badge variant="ghost" className="text-muted-foreground">
                  {t(getProfileFileParseStatusKey(file.parsedStatus))}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={t('profile.view.fileDownload')}
                    disabled={rowBusy}
                    loading={activeAction?.fileId === file.id && activeAction.action === 'download'}
                    onClick={() => onDownload(file)}
                  >
                    <Download aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={t('profile.view.fileReplace')}
                    disabled={rowBusy}
                    loading={activeAction?.fileId === file.id && activeAction.action === 'replace'}
                    onClick={() => onReplace(file)}
                  >
                    <RefreshCw aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    aria-label={t('profile.view.fileDelete')}
                    disabled={rowBusy}
                    loading={activeAction?.fileId === file.id && activeAction.action === 'delete'}
                    onClick={() => onDelete(file)}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
