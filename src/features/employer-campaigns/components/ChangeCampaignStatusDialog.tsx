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
import type { CampaignStatusUpdateRequest } from '../types/campaign.api.types';

type StatusTarget = Extract<CampaignStatusUpdateRequest['status'], 'Closed' | 'Archived'>;

interface ChangeCampaignStatusDialogProps {
  targetStatus: StatusTarget;
  onConfirm: () => Promise<void>;
  disabled?: boolean;
}

/**
 * Active → Closed → Archived via PUT …/status (confirm first).
 */
export function ChangeCampaignStatusDialog({
  targetStatus,
  onConfirm,
  disabled,
}: ChangeCampaignStatusDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const key = targetStatus === 'Closed' ? 'close' : 'archive';

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isSubmitting) return;
        setOpen(next);
      }}
    >
      <DialogTrigger render={<Button type="button" variant="outline" disabled={disabled} />}>
        {t(`employer.campaigns.detail.${key}`)}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>{t(`employer.campaigns.${key}Confirm.title`)}</DialogTitle>
          <DialogDescription>{t(`employer.campaigns.${key}Confirm.description`)}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <DialogClose render={<Button type="button" variant="outline" disabled={isSubmitting} />}>
            {t(`employer.campaigns.${key}Confirm.cancel`)}
          </DialogClose>
          <Button
            type="button"
            disabled={isSubmitting}
            loading={isSubmitting}
            onClick={handleConfirm}
          >
            {t(`employer.campaigns.${key}Confirm.confirm`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
