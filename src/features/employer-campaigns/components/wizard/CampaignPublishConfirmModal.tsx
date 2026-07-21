import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../../types/campaignManagement.types';

interface CampaignPublishConfirmModalProps {
  open: boolean;
  campaign: EmployerCampaign | null;
  domainLabel?: string;
  questionCount: number;
  startsAt?: string;
  expiresAt?: string;
  isPublishing?: boolean;
  onKeepDraft: () => void;
  onPublish: () => void;
}

export function CampaignPublishConfirmModal({
  open,
  campaign,
  domainLabel,
  questionCount,
  startsAt,
  expiresAt,
  isPublishing = false,
  onKeepDraft,
  onPublish,
}: CampaignPublishConfirmModalProps) {
  const { t } = useLanguage();
  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !isPublishing && onKeepDraft()}>
      <DialogContent className="sm:max-w-lg" showCloseButton={!isPublishing}>
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.publishConfirm.title')}</DialogTitle>
          <DialogDescription>{t('employer.campaigns.publishConfirm.description')}</DialogDescription>
        </DialogHeader>

        <dl className="space-y-2 rounded-lg border border-satin bg-surface-overlay px-4 py-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('employer.campaigns.form.title')}</dt>
            <dd className="font-medium text-foreground">{campaign.title}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('employer.campaigns.form.domain')}</dt>
            <dd className="font-medium text-foreground">{domainLabel || campaign.company}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('employer.campaigns.form.questionsUnit')}</dt>
            <dd className="font-medium text-foreground">{questionCount}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('employer.campaigns.form.startsAt')}</dt>
            <dd className="font-medium text-foreground">{startsAt || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('employer.campaigns.form.expiresAt')}</dt>
            <dd className="font-medium text-foreground">{expiresAt || campaign.deadline || '—'}</dd>
          </div>
        </dl>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="outline" disabled={isPublishing} onClick={onKeepDraft}>
            {t('employer.campaigns.publishConfirm.keepDraft')}
          </Button>
          <Button type="button" disabled={isPublishing} loading={isPublishing} onClick={onPublish}>
            {t('employer.campaigns.publishConfirm.publish')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
