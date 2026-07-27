import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { useLanguage } from '@/shared/languages';

interface ProfileFilesBulkDeleteDialogProps {
  open: boolean;
  loading: boolean;
  selectedCount: number;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ProfileFilesBulkDeleteDialog({
  open,
  loading,
  selectedCount,
  onOpenChange,
  onConfirm,
}: ProfileFilesBulkDeleteDialogProps) {
  const { t } = useLanguage();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('profile.view.deleteSelectedTitle')}
      description={t('profile.view.deleteSelectedDesc').replace(
        '{count}',
        String(selectedCount),
      )}
      confirmLabel={t('profile.view.deleteSelectedConfirm')}
      cancelLabel={t('profile.education.cancel')}
      destructive
      loading={loading}
      icon={<Trash2 className="size-5" aria-hidden />}
      onConfirm={onConfirm}
    />
  );
}

