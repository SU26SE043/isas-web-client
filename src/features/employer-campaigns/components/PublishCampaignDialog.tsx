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
import type { EmployerCampaign } from '../types/campaignManagement.types';

interface PublishCampaignDialogProps {
  campaign: EmployerCampaign;
  onPublish: () => Promise<void>;
  disabled?: boolean;
}

export function PublishCampaignDialog({ campaign, onPublish, disabled }: PublishCampaignDialogProps) {
  const { t } = useLanguage();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish();
    } finally {
      setIsPublishing(false);
    }
  };

  const inviteCount = campaign.candidates.length;

  return (
    <Dialog>
      <DialogTrigger render={<Button disabled={disabled} />}>{t('employer.campaigns.detail.publish')}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.publishPreview.title')}</DialogTitle>
          <DialogDescription>{t('employer.campaigns.publishPreview.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-xl border border-subtle bg-surface-overlay p-4 text-sm">
          <p className="font-medium text-foreground">
            {t('employer.campaigns.publishPreview.subject').replace('{title}', campaign.title)}
          </p>
          <p className="text-muted-foreground">
            {t('employer.campaigns.publishPreview.body')
              .replace('{title}', campaign.title)
              .replace('{company}', campaign.company)
              .replace('{count}', String(inviteCount))}
          </p>
          <p className="rounded-lg border border-dashed border-subtle bg-surface-base px-3 py-2 font-mono text-xs text-muted-foreground">
            {t('employer.campaigns.publishPreview.linkExample')}
          </p>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{t('employer.campaigns.publishPreview.cancel')}</DialogClose>
          <Button type="button" onClick={handlePublish} loading={isPublishing}>
            {t('employer.campaigns.publishPreview.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
