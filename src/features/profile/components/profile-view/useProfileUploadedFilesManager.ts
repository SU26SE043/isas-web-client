import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { cvAnalysisService } from '@/features/cv-analysis/services/cvAnalysis.service';
import type { FileRecord } from '@/features/cv-analysis/types/cvAnalysis.types';
import { validateCvFile } from '@/features/cv-analysis/utils/cvFileValidation';
import { useLanguage } from '@/shared/languages';
import type { ProfileFileCardAction } from './profileFileActions.types';
import {
  filterAndSortProfileFiles,
  type ProfileFileSort,
  type ProfileFileTypeFilter,
} from './profileFilesFilter';
import { resolveCvFileActionError } from './resolveCvFileActionError';

type PendingReplace = {
  file: FileRecord;
  newFile: File;
};

interface UseProfileUploadedFilesManagerOptions {
  files: FileRecord[];
  reload: () => Promise<void>;
}

export function useProfileUploadedFilesManager({
  files,
  reload,
}: UseProfileUploadedFilesManagerOptions) {
  const { t } = useLanguage();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetRef = useRef<FileRecord | null>(null);

  const [typeFilter, setTypeFilter] = useState<ProfileFileTypeFilter>('all');
  const [sort, setSort] = useState<ProfileFileSort>('newest');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const selectedCount = selectedFileIds.length;

  const filteredFiles = useMemo(
    () => filterAndSortProfileFiles(files, typeFilter, sort),
    [files, sort, typeFilter],
  );

  const isAllSelected =
    filteredFiles.length > 0 && selectedCount === filteredFiles.length;
  const isSomeSelected = selectedCount > 0 && selectedCount < filteredFiles.length;

  const [activeAction, setActiveAction] = useState<{
    fileId: string;
    action: ProfileFileCardAction;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileRecord | null>(null);
  const [replacePending, setReplacePending] = useState<PendingReplace | null>(
    null,
  );
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [isReplaceConfirming, setIsReplaceConfirming] = useState(false);

  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] =
    useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const isSelectionDisabled =
    isBulkDeleting ||
    isBulkDeleteConfirmOpen ||
    deleteTarget !== null ||
    replacePending !== null;

  useEffect(() => {
    setSelectedFileIds((prev) =>
      prev.filter((id) => filteredFiles.some((f) => f.id === id)),
    );
  }, [filteredFiles]);

  const toggleFileSelected = useCallback((fileId: string) => {
    setSelectedFileIds((prev) => {
      if (prev.includes(fileId)) return prev.filter((id) => id !== fileId);
      return [...prev, fileId];
    });
  }, []);

  const clearSelected = useCallback(() => {
    setSelectedFileIds([]);
  }, []);

  const setSelectedAll = useCallback(
    (checked: boolean) => {
      if (!checked) {
        setSelectedFileIds([]);
        return;
      }
      setSelectedFileIds(filteredFiles.map((f) => f.id));
    },
    [filteredFiles],
  );

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

      const validation = validateCvFile(selected);
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
      await cvAnalysisService.replaceFile(
        replacePending.file.id,
        replacePending.newFile,
      );
      toast.success(t('profile.view.replaceSuccess'));
      setReplacePending(null);
      await reload();
    } catch (err) {
      toast.error(
        resolveCvFileActionError(err, t, 'profile.view.filesReplaceError'),
      );
    } finally {
      setIsReplaceConfirming(false);
      setActiveAction(null);
    }
  }, [reload, replacePending, t]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleteConfirming(true);
    setActiveAction({ fileId: deleteTarget.id, action: 'delete' });
    try {
      await cvAnalysisService.deleteFile(deleteTarget.id);
      toast.success(t('profile.view.deleteSuccess'));
      setSelectedFileIds([]);
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      toast.error(
        resolveCvFileActionError(err, t, 'profile.view.filesDeleteError'),
      );
    } finally {
      setIsDeleteConfirming(false);
      setActiveAction(null);
    }
  }, [deleteTarget, reload, t]);

  const confirmBulkDelete = useCallback(async () => {
    if (selectedFileIds.length === 0) return;

    setIsBulkDeleting(true);
    try {
      const idsToDelete = [...selectedFileIds];
      const fileById = new Map(filteredFiles.map((f) => [f.id, f]));

      const results = await Promise.allSettled(
        idsToDelete.map((id) => cvAnalysisService.deleteFile(id)),
      );

      let successCount = 0;
      const failedMessages: string[] = [];

      results.forEach((result, index) => {
        const id = idsToDelete[index];
        const file = fileById.get(id);
        if (result.status === 'fulfilled') {
          successCount += 1;
          return;
        }

        const message = resolveCvFileActionError(
          result.reason,
          t,
          'profile.view.filesDeleteError',
        );
        const name = file?.originalName ?? id;
        failedMessages.push(`${name}: ${message}`);
      });

      if (successCount > 0) {
        toast.success(
          t('profile.view.deleteSelectedSuccess').replace(
            '{count}',
            String(successCount),
          ),
        );
      }
      if (failedMessages.length > 0) {
        toast.error(
          t('profile.view.deleteSelectedErrorSummary').replace(
            '{count}',
            String(failedMessages.length),
          ),
        );
        toast.error(
          `${t('profile.view.deleteSelectedErrorDetailsPrefix')}\n${failedMessages.join(
            '\n',
          )}`,
        );
      }
    } finally {
      setIsBulkDeleteConfirmOpen(false);
      setSelectedFileIds([]);
      await reload();
      setIsBulkDeleting(false);
    }
  }, [filteredFiles, reload, selectedFileIds, t]);

  return {
    t,
    filteredFiles,
    typeFilter,
    sort,
    setTypeFilter,
    setSort,
    fileInputRef,
    handleReplaceFileSelected,
    selectedFileIds,
    selectedCount,
    isAllSelected,
    isSomeSelected,
    isSelectionDisabled,
    isBulkDeleting,
    activeAction,
    deleteTarget,
    replacePending,
    isDeleteConfirming,
    isReplaceConfirming,
    isBulkDeleteConfirmOpen,
    toggleFileSelected,
    clearSelected,
    setSelectedAll,
    setDeleteTarget,
    openReplacePicker,
    handleDownload,
    setReplacePending,
    confirmReplace,
    confirmDelete,
    confirmBulkDelete,
    setIsBulkDeleteConfirmOpen,
    reload,
  };
}
