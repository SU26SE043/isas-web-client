import { Link } from 'react-router-dom';
import { BarChart3, Pencil, Send, UsersRound } from 'lucide-react';
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
  const isActive = campaign.status === 'active';
  const isDraft = campaign.status === 'draft';
  const isClosed = campaign.status === 'closed';
  const canDelete = isDraft || isClosed || campaign.status === 'archived';
  const resultsTo = `/employer/campaigns/${campaign.id}/results`;
  const pipelineTo = `/employer/campaigns/${campaign.id}/candidates`;

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

      {isActive ? (
        <>
          <Button render={<Link to={`/employer/campaigns/${campaign.id}/invitations/new`} />}>
            <Send aria-hidden />
            {t('employer.campaigns.detail.inviteCandidates')}
          </Button>
          <Button variant="outline" render={<Link to={resultsTo} />}>
            <BarChart3 aria-hidden />
            {t('employer.campaigns.results.title')}
          </Button>
          <Button variant="outline" render={<Link to={pipelineTo} />}>
            <UsersRound aria-hidden />
            {t('employer.campaigns.detail.pipeline')}
          </Button>
          <ChangeCampaignStatusDialog
            targetStatus="Closed"
            onConfirm={() => onChangeStatus('Closed')}
          />
        </>
      ) : null}

      {isClosed ? (
        <>
          <Button variant="outline" render={<Link to={resultsTo} />}>
            <BarChart3 aria-hidden />
            {t('employer.campaigns.results.title')}
          </Button>
          <Button variant="outline" render={<Link to={pipelineTo} />}>
            <UsersRound aria-hidden />
            {t('employer.campaigns.detail.pipeline')}
          </Button>
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
          <Button variant="outline" render={<Link to={pipelineTo} />}>
            <UsersRound aria-hidden />
            {t('employer.campaigns.detail.pipeline')}
          </Button>
          {canDelete && onDelete ? (
            <DeleteCampaignDialog campaignTitle={campaign.title} onDelete={onDelete} />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
