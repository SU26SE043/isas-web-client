import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import type { ProfileFileSort, ProfileFileTypeFilter } from './profileFilesFilter';

interface ProfileFilesSelectionToolbarProps {
  showSelectAll: boolean;
  selectedCount: number;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  isSelectionDisabled: boolean;
  isBulkDeleting: boolean;
  typeFilter: ProfileFileTypeFilter;
  sort: ProfileFileSort;
  onTypeFilterChange: (value: ProfileFileTypeFilter) => void;
  onSortChange: (value: ProfileFileSort) => void;
  onClearSelection: () => void;
  onSetSelectedAll: (checked: boolean) => void;
  onOpenBulkDelete: () => void;
}

const selectClassName =
  'rounded-lg border border-default bg-surface-overlay px-3 py-2 text-sm text-foreground';

export function ProfileFilesSelectionToolbar({
  showSelectAll,
  selectedCount,
  isAllSelected,
  isSomeSelected,
  isSelectionDisabled,
  isBulkDeleting,
  typeFilter,
  sort,
  onTypeFilterChange,
  onSortChange,
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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
        ) : (
          <span className="text-sm text-muted-foreground">{t('profile.view.uploadedFilesHint')}</span>
        )}

        <div className="flex flex-wrap gap-2">
          <select
            className={selectClassName}
            value={typeFilter}
            disabled={isSelectionDisabled || isBulkDeleting}
            onChange={(event) => onTypeFilterChange(event.target.value as ProfileFileTypeFilter)}
            aria-label={t('profile.view.filesFilterTypeAria')}
          >
            <option value="all">{t('profile.view.filesFilterAllTypes')}</option>
            <option value="cv">{t('profile.view.filesFilterCv')}</option>
            <option value="jd">{t('profile.view.filesFilterJd')}</option>
          </select>
          <select
            className={selectClassName}
            value={sort}
            disabled={isSelectionDisabled || isBulkDeleting}
            onChange={(event) => onSortChange(event.target.value as ProfileFileSort)}
            aria-label={t('profile.view.filesSortAria')}
          >
            <option value="newest">{t('profile.view.filesSortNewest')}</option>
            <option value="oldest">{t('profile.view.filesSortOldest')}</option>
          </select>
        </div>
      </div>

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
