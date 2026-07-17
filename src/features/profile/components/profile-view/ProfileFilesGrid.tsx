import type { FileRecord } from '@/features/cv-analysis/types/cvAnalysis.types';
import { ProfileFileCard, type ProfileFileCardAction } from './ProfileFileCard';

interface ProfileFilesGridProps {
  files: FileRecord[];
  selectedFileIds: string[];
  activeAction: { fileId: string; action: ProfileFileCardAction } | null;
  isSelectionDisabled: boolean;
  isBulkDeleting: boolean;
  onToggleSelected: (fileId: string) => void;
  onDownload: (file: FileRecord) => void;
  onReplace: (file: FileRecord) => void;
  onDelete: (file: FileRecord) => void;
}

export function ProfileFilesGrid({
  files,
  selectedFileIds,
  activeAction,
  isSelectionDisabled,
  isBulkDeleting,
  onToggleSelected,
  onDownload,
  onReplace,
  onDelete,
}: ProfileFilesGridProps) {
  const selectedSet = new Set(selectedFileIds);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {files.map((file) => (
        <ProfileFileCard
          key={file.id}
          file={file}
          isSelected={selectedSet.has(file.id)}
          activeAction={
            activeAction?.fileId === file.id ? activeAction.action : null
          }
          isSelectionDisabled={isSelectionDisabled}
          isCardActionsDisabled={isBulkDeleting}
          onToggleSelected={() => onToggleSelected(file.id)}
          onDownload={() => onDownload(file)}
          onReplace={() => onReplace(file)}
          onDelete={() => onDelete(file)}
        />
      ))}
    </div>
  );
}

