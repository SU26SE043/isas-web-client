import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { useLanguage } from '@/shared/languages';

interface ProfileSingleDeleteDialogProps {
  open: boolean;
  loading: boolean;
  fileName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ProfileSingleDeleteDialog({
  open,
  loading,
  fileName,
  onOpenChange,
  onConfirm,
}: ProfileSingleDeleteDialogProps) {
  const { t } = useLanguage();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('profile.view.deleteFileTitle')}
      description={t('profile.view.deleteFileDesc').replace('{name}', fileName)}
      confirmLabel={t('profile.view.fileDelete')}
      cancelLabel={t('profile.education.cancel')}
      destructive
      loading={loading}
      icon={<Trash2 className="size-5" aria-hidden />}
      onConfirm={onConfirm}
    />
  );
}

