import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { FileRecord } from '@/features/cv-analysis/types/cvAnalysis.types';
import { useProfileUploadedFilesManager } from './useProfileUploadedFilesManager';
import { ProfileFilesSelectionToolbar } from './ProfileFilesSelectionToolbar';
import { ProfileFilesTable } from './ProfileFilesTable';
import { ProfileFileUploadCard } from './ProfileFileUploadCard';
import { ProfileSingleDeleteDialog } from './ProfileSingleDeleteDialog';
import { ProfileSingleReplaceDialog } from './ProfileSingleReplaceDialog';
import { ProfileFilesBulkDeleteDialog } from './ProfileFilesBulkDeleteDialog';

interface ProfileUploadedFilesSectionProps {
  files: FileRecord[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function ProfileUploadedFilesSection({
  files,
  isLoading,
  error,
  reload,
}: ProfileUploadedFilesSectionProps) {
  const manager = useProfileUploadedFilesManager({ files, reload });
  const {
    t,
    filteredFiles,
    typeFilter,
    sort,
    setTypeFilter,
    setSort,
    fileInputRef,
    handleReplaceFileSelected,
    activeAction,
    deleteTarget,
    replacePending,
    isDeleteConfirming,
    isReplaceConfirming,
    isBulkDeleteConfirmOpen,
    isBulkDeleting,
    selectedFileIds,
    selectedCount,
    isAllSelected,
    isSomeSelected,
    isSelectionDisabled,
    toggleFileSelected,
    clearSelected,
    setSelectedAll,
    handleDownload,
    openReplacePicker,
    setDeleteTarget,
    setReplacePending,
    setIsBulkDeleteConfirmOpen,
    confirmDelete,
    confirmReplace,
    confirmBulkDelete,
  } = manager;

  const isUploadDisabled =
    isLoading ||
    isBulkDeleting ||
    deleteTarget !== null ||
    replacePending !== null;

  return (
    <>
      <section className="space-y-4">
        <div>
          <h2 className="heading-secondary text-lg text-foreground">
            {t('profile.view.uploadedFiles')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('profile.view.uploadedFilesHint')}</p>
        </div>

        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : null}

        {!isLoading && error ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-satin bg-surface-overlay px-4 py-6 text-center">
            <AlertCircle className="size-8 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">{t('profile.view.filesLoadError')}</p>
            <Button type="button" variant="secondary" size="sm" onClick={() => void reload()}>
              {t('profile.view.filesRetry')}
            </Button>
          </div>
        ) : null}

        {!isLoading && !error ? (
          <div className="space-y-4">
            <ProfileFilesSelectionToolbar
              showSelectAll={filteredFiles.length >= 2}
              selectedCount={selectedCount}
              isAllSelected={isAllSelected}
              isSomeSelected={isSomeSelected}
              isSelectionDisabled={isSelectionDisabled}
              isBulkDeleting={isBulkDeleting}
              typeFilter={typeFilter}
              sort={sort}
              onTypeFilterChange={setTypeFilter}
              onSortChange={setSort}
              onClearSelection={clearSelected}
              onSetSelectedAll={setSelectedAll}
              onOpenBulkDelete={() => setIsBulkDeleteConfirmOpen(true)}
            />
            <ProfileFilesTable
              files={filteredFiles}
              selectedFileIds={selectedFileIds}
              isAllSelected={isAllSelected}
              isSomeSelected={isSomeSelected}
              activeAction={activeAction}
              isSelectionDisabled={isSelectionDisabled}
              isBulkDeleting={isBulkDeleting}
              onToggleSelected={toggleFileSelected}
              onSetSelectedAll={setSelectedAll}
              onDownload={(file) => void handleDownload(file)}
              onReplace={(file) => void openReplacePicker(file)}
              onDelete={(file) => setDeleteTarget(file)}
            />
            <ProfileFileUploadCard disabled={isUploadDisabled} onUploaded={reload} />
          </div>
        ) : null}
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
        className="sr-only"
        onChange={handleReplaceFileSelected}
      />

      <ProfileSingleDeleteDialog
        open={deleteTarget !== null}
        loading={isDeleteConfirming}
        fileName={deleteTarget?.originalName ?? ''}
        onOpenChange={(open) => {
          if (!open && !isDeleteConfirming) setDeleteTarget(null);
        }}
        onConfirm={() => void confirmDelete()}
      />

      <ProfileSingleReplaceDialog
        open={replacePending !== null}
        loading={isReplaceConfirming}
        newFileName={replacePending?.newFile.name ?? ''}
        onOpenChange={(open) => {
          if (!open && !isReplaceConfirming) setReplacePending(null);
        }}
        onConfirm={() => void confirmReplace()}
      />

      <ProfileFilesBulkDeleteDialog
        open={isBulkDeleteConfirmOpen}
        loading={isBulkDeleting}
        selectedCount={selectedCount}
        onOpenChange={(open) => {
          if (!open && !isBulkDeleting) setIsBulkDeleteConfirmOpen(false);
        }}
        onConfirm={() => void confirmBulkDelete()}
      />
    </>
  );
}
