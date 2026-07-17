import { AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfileUploadedFilesManager } from './useProfileUploadedFilesManager';
import { ProfileFilesSelectionToolbar } from './ProfileFilesSelectionToolbar';
import { ProfileFilesGrid } from './ProfileFilesGrid';
import { ProfileSingleDeleteDialog } from './ProfileSingleDeleteDialog';
import { ProfileSingleReplaceDialog } from './ProfileSingleReplaceDialog';
import { ProfileFilesBulkDeleteDialog } from './ProfileFilesBulkDeleteDialog';

export function ProfileUploadedFilesSection() {
  const manager = useProfileUploadedFilesManager();
  const {
    t,
    files,
    isLoading,
    error,
    reload,
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

  return (
    <>
      <Card className="border border-subtle bg-surface-raised">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div>
            <h2 className="heading-secondary text-lg text-foreground">
              {t('profile.view.uploadedFiles')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('profile.view.uploadedFilesHint')}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-52 w-full rounded-lg" />
              ))}
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-subtle bg-surface-overlay px-4 py-8 text-center">
              <AlertCircle className="size-8 text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">
                {t('profile.view.filesLoadError')}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void reload()}
              >
                {t('profile.view.filesRetry')}
              </Button>
            </div>
          ) : null}

          {!isLoading && !error && files.length === 0 ? (
            <div className="rounded-lg border border-dashed border-subtle bg-surface-overlay px-4 py-8 text-center">
              <FileText className="mx-auto size-8 text-muted-foreground" aria-hidden />
              <p className="mt-3 text-sm font-medium text-foreground">
                {t('profile.view.filesEmptyTitle')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('profile.view.filesEmptyHint')}
              </p>
            </div>
          ) : null}

          {!isLoading && !error && files.length > 0 ? (
            <div className="space-y-4">
              <ProfileFilesSelectionToolbar
                showSelectAll={files.length >= 2}
                selectedCount={selectedCount}
                isAllSelected={isAllSelected}
                isSomeSelected={isSomeSelected}
                isSelectionDisabled={isSelectionDisabled}
                isBulkDeleting={isBulkDeleting}
                onClearSelection={clearSelected}
                onSetSelectedAll={setSelectedAll}
                onOpenBulkDelete={() => setIsBulkDeleteConfirmOpen(true)}
              />
              <ProfileFilesGrid
                files={files}
                selectedFileIds={selectedFileIds}
                activeAction={activeAction}
                isSelectionDisabled={isSelectionDisabled}
                isBulkDeleting={isBulkDeleting}
                onToggleSelected={toggleFileSelected}
                onDownload={(file) => void handleDownload(file)}
                onReplace={(file) => void openReplacePicker(file)}
                onDelete={(file) => setDeleteTarget(file)}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
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

