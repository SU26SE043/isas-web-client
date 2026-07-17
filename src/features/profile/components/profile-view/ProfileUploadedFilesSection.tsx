import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { AlertCircle, FileText, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cvAnalysisService } from '@/features/cv-analysis/services/cvAnalysis.service';
import type { FileRecord } from '@/features/cv-analysis/types/cvAnalysis.types';
import { validatePdfFile } from '@/features/cv-analysis/utils/cvFileValidation';
import { useInterviewFiles } from '@/features/cv-analysis/hooks/useInterviewFiles';
import { useLanguage } from '@/shared/languages';
import { ProfileFileCard, type ProfileFileCardAction } from './ProfileFileCard';
import { resolveCvFileActionError } from './resolveCvFileActionError';

type PendingReplace = {
  file: FileRecord;
  newFile: File;
};

export function ProfileUploadedFilesSection() {
  const { t } = useLanguage();
  const { files, isLoading, error, reload } = useInterviewFiles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetRef = useRef<FileRecord | null>(null);

  const [activeAction, setActiveAction] = useState<{
    fileId: string;
    action: ProfileFileCardAction;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileRecord | null>(null);
  const [replacePending, setReplacePending] = useState<PendingReplace | null>(null);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [isReplaceConfirming, setIsReplaceConfirming] = useState(false);

  const handleDownload = useCallback(
    async (file: FileRecord) => {
      setActiveAction({ fileId: file.id, action: 'download' });
      try {
        await cvAnalysisService.downloadFile(file.id, file.originalName);
      } catch (err) {
        toast.error(
          resolveCvFileActionError(err, t, 'profile.view.filesDownloadError'),
        );
      } finally {
        setActiveAction(null);
      }
    },
    [t],
  );

  const openReplacePicker = useCallback((file: FileRecord) => {
    replaceTargetRef.current = file;
    fileInputRef.current?.click();
  }, []);

  const handleReplaceFileSelected = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selected = event.target.files?.[0];
      event.target.value = '';
      const target = replaceTargetRef.current;
      if (!selected || !target) return;

      const validation = validatePdfFile(selected);
      if (validation === 'invalidType') {
        toast.error(t('cv.invalidType'));
        return;
      }
      if (validation === 'invalidSize') {
        toast.error(t('cv.invalidSize'));
        return;
      }

      setReplacePending({ file: target, newFile: selected });
    },
    [t],
  );

  const confirmReplace = useCallback(async () => {
    if (!replacePending) return;
    setIsReplaceConfirming(true);
    setActiveAction({ fileId: replacePending.file.id, action: 'replace' });
    try {
      await cvAnalysisService.replaceFile(replacePending.file.id, replacePending.newFile);
      toast.success(t('profile.view.replaceSuccess'));
      setReplacePending(null);
      await reload();
    } catch (err) {
      toast.error(resolveCvFileActionError(err, t, 'profile.view.filesReplaceError'));
    } finally {
      setIsReplaceConfirming(false);
      setActiveAction(null);
    }
  }, [replacePending, reload, t]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleteConfirming(true);
    setActiveAction({ fileId: deleteTarget.id, action: 'delete' });
    try {
      await cvAnalysisService.deleteFile(deleteTarget.id);
      toast.success(t('profile.view.deleteSuccess'));
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      toast.error(resolveCvFileActionError(err, t, 'profile.view.filesDeleteError'));
    } finally {
      setIsDeleteConfirming(false);
      setActiveAction(null);
    }
  }, [deleteTarget, reload, t]);

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
              <p className="text-sm text-muted-foreground">{t('profile.view.filesLoadError')}</p>
              <Button type="button" variant="secondary" size="sm" onClick={() => void reload()}>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => (
                <ProfileFileCard
                  key={file.id}
                  file={file}
                  activeAction={
                    activeAction?.fileId === file.id ? activeAction.action : null
                  }
                  onDownload={() => void handleDownload(file)}
                  onReplace={() => openReplacePicker(file)}
                  onDelete={() => setDeleteTarget(file)}
                />
              ))}
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

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleteConfirming) setDeleteTarget(null);
        }}
        title={t('profile.view.deleteFileTitle')}
        description={t('profile.view.deleteFileDesc').replace(
          '{name}',
          deleteTarget?.originalName ?? '',
        )}
        confirmLabel={t('profile.view.fileDelete')}
        cancelLabel={t('profile.education.cancel')}
        destructive
        loading={isDeleteConfirming}
        icon={<Trash2 className="size-5" aria-hidden />}
        onConfirm={() => void confirmDelete()}
      />

      <ConfirmDialog
        open={replacePending !== null}
        onOpenChange={(open) => {
          if (!open && !isReplaceConfirming) setReplacePending(null);
        }}
        title={t('profile.view.replaceFileTitle')}
        description={t('profile.view.replaceFileDesc').replace(
          '{name}',
          replacePending?.newFile.name ?? '',
        )}
        confirmLabel={t('profile.view.fileReplace')}
        cancelLabel={t('profile.education.cancel')}
        loading={isReplaceConfirming}
        icon={<FileText className="size-5" aria-hidden />}
        onConfirm={() => void confirmReplace()}
      />
    </>
  );
}
