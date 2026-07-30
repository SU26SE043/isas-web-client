import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { ChangeCampaignStatusDialog } from './ChangeCampaignStatusDialog';
import { DeleteCampaignDialog } from './DeleteCampaignDialog';
import { PublishCampaignDialog } from './PublishCampaignDialog';
import type { CampaignStatusUpdateRequest } from '../types/campaign.api.types';
import type { EmployerCampaign } from '../types/campaignManagement.types';

interface CampaignDetailActionsProps {
  campaign: EmployerCampaign;
  onPublish: () => Promise<void>;
  onChangeStatus: (status: CampaignStatusUpdateRequest['status']) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function CampaignDetailActions({
  campaign,
  onPublish,
  onChangeStatus,
  onDelete,
}: CampaignDetailActionsProps) {
  const { t } = useLanguage();
  const isDraft = campaign.status === 'draft';
  const isClosed = campaign.status === 'closed';
  const canDelete = isDraft || isClosed || campaign.status === 'archived';

  return (
    <div className="flex flex-wrap gap-2">
      {isDraft ? (
        <>
          <Button variant="outline" render={<Link to={`/employer/campaigns/${campaign.id}/edit`} />}>
            <Pencil aria-hidden />
            {t('employer.campaigns.detail.edit')}
          </Button>
          <PublishCampaignDialog onPublish={onPublish} />
          {onDelete ? (
            <DeleteCampaignDialog campaignTitle={campaign.title} onDelete={onDelete} />
          ) : null}
        </>
      ) : null}

      {isClosed ? (
        <>
          <ChangeCampaignStatusDialog
            targetStatus="Archived"
            onConfirm={() => onChangeStatus('Archived')}
          />
          {onDelete ? (
            <DeleteCampaignDialog campaignTitle={campaign.title} onDelete={onDelete} />
          ) : null}
        </>
      ) : null}

      {campaign.status === 'archived' || campaign.status === 'paused' ? (
        <>
          {canDelete && onDelete ? (
            <DeleteCampaignDialog campaignTitle={campaign.title} onDelete={onDelete} />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
