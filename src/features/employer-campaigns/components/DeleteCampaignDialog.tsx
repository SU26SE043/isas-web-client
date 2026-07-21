import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLanguage } from '@/shared/languages';

interface DeleteCampaignDialogProps {
  campaignTitle: string;
  onDelete: () => Promise<void>;
  disabled?: boolean;
}

export function DeleteCampaignDialog({
  campaignTitle,
  onDelete,
  disabled,
}: DeleteCampaignDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete();
      setOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isDeleting) return;
        setOpen(next);
      }}
    >
      <DialogTrigger
        render={<Button type="button" variant="outline" disabled={disabled} className="text-error" />}
      >
        {t('employer.campaigns.detail.delete')}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" showCloseButton={!isDeleting}>
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.deleteConfirm.title')}</DialogTitle>
          <DialogDescription>
            {t('employer.campaigns.deleteConfirm.description').replace('{title}', campaignTitle)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <DialogClose render={<Button type="button" variant="outline" disabled={isDeleting} />}>
            {t('employer.campaigns.deleteConfirm.cancel')}
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            loading={isDeleting}
            onClick={handleDelete}
          >
            {t('employer.campaigns.deleteConfirm.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
