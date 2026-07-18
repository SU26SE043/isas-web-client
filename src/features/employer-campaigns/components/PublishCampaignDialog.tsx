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

interface PublishCampaignDialogProps {
  onPublish: () => Promise<void>;
  disabled?: boolean;
}

/**
 * Draft preview → Publish: simple confirm, then POST …/publish.
 * No invitation-email preview (invite is Flow 2 after Active).
 */
export function PublishCampaignDialog({ onPublish, disabled }: PublishCampaignDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    try {
      await onPublish();
      setOpen(false);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isPublishing) return;
        setOpen(next);
      }}
    >
      <DialogTrigger render={<Button disabled={disabled} />}>
        {t('employer.campaigns.detail.publish')}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" showCloseButton={!isPublishing}>
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.publishConfirm.title')}</DialogTitle>
          <DialogDescription>{t('employer.campaigns.publishConfirm.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <DialogClose
            render={<Button type="button" variant="outline" disabled={isPublishing} />}
          >
            {t('employer.campaigns.publishConfirm.cancel')}
          </DialogClose>
          <Button type="button" disabled={isPublishing} loading={isPublishing} onClick={handlePublish}>
            {t('employer.campaigns.publishConfirm.publish')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
