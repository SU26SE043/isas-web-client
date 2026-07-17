import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';

interface ProfileFilesSelectionToolbarProps {
  showSelectAll: boolean;
  selectedCount: number;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  isSelectionDisabled: boolean;
  isBulkDeleting: boolean;
  onClearSelection: () => void;
  onSetSelectedAll: (checked: boolean) => void;
  onOpenBulkDelete: () => void;
}

export function ProfileFilesSelectionToolbar({
  showSelectAll,
  selectedCount,
  isAllSelected,
  isSomeSelected,
  isSelectionDisabled,
  isBulkDeleting,
  onClearSelection,
  onSetSelectedAll,
  onOpenBulkDelete,
}: ProfileFilesSelectionToolbarProps) {
  const { t } = useLanguage();
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = isSomeSelected && !isAllSelected;
  }, [isSomeSelected, isAllSelected]);

  return (
    <div className="space-y-4">
      {showSelectAll ? (
        <div className="flex items-center gap-3">
          <input
            ref={selectAllRef}
            type="checkbox"
            checked={isAllSelected}
            disabled={isSelectionDisabled}
            onChange={(e) => onSetSelectedAll(e.target.checked)}
            className="size-4 rounded border-satin bg-surface-base accent-white"
            aria-label={t('profile.view.selectAllAria')}
          />
          <span className="text-sm font-medium text-foreground">
            {t('profile.view.selectAll')}
          </span>
        </div>
      ) : null}

      {selectedCount > 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-subtle bg-surface-overlay p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-foreground">
            {t('profile.view.filesSelectedLabel').replace(
              '{count}',
              String(selectedCount),
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              disabled={isSelectionDisabled || isBulkDeleting}
            >
              {t('profile.view.clearSelection')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onOpenBulkDelete}
              disabled={isSelectionDisabled || isBulkDeleting}
            >
              {t('profile.view.deleteSelectedAction')}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

