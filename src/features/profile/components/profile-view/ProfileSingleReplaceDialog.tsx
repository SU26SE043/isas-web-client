import { FileText } from 'lucide-react';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { useLanguage } from '@/shared/languages';

interface ProfileSingleReplaceDialogProps {
  open: boolean;
  loading: boolean;
  newFileName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ProfileSingleReplaceDialog({
  open,
  loading,
  newFileName,
  onOpenChange,
  onConfirm,
}: ProfileSingleReplaceDialogProps) {
  const { t } = useLanguage();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('profile.view.replaceFileTitle')}
      description={t('profile.view.replaceFileDesc').replace(
        '{name}',
        newFileName,
      )}
      confirmLabel={t('profile.view.fileReplace')}
      cancelLabel={t('profile.education.cancel')}
      loading={loading}
      icon={<FileText className="size-5" aria-hidden />}
      onConfirm={onConfirm}
    />
  );
}

