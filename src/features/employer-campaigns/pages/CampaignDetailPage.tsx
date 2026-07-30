/* Hallmark · pre-emit critique: P4 H5 E4 S5 R5 V4 */
import { useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import { CampaignDetailView } from '../components/CampaignDetailView';
import { CampaignContextHeader } from '../components/CampaignContextHeader';
import { CampaignResultsPanel } from '../components/results/CampaignResultsPanel';
import { useEmployerCampaign } from '../hooks/useEmployerCampaigns';
import { campaignManagementService } from '../services/campaignManagement.service';
import type { CampaignStatusUpdateRequest } from '../types/campaign.api.types';

export function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { campaign, isLoading, isError, errorStatus, reload, publish, updateStatus, deleteCampaign } =
    useEmployerCampaign(id);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const tab = searchParams.get('tab') ?? 'details';

  if (tab !== 'details' && tab !== 'results') {
    return <Navigate to={`/employer/campaigns/${id}/overview?tab=details`} replace />;
  }

  const handlePublish = async () => {
    if (!campaign) return;
    try {
      const result = await publish(campaign.id);
      setWarnings(result.warnings);
      setPublished(result.warnings.length === 0);
      if (result.warnings.length === 0) {
        toast.success(t('employer.campaigns.detail.publishSuccess'));
        reload();
      }
    } catch {
      setPublished(false);
      setWarnings([]);
      toast.error(t('employer.campaigns.wizard.publishFailed'));
      throw new Error('PUBLISH_FAILED');
    }
  };

  const handleChangeStatus = async (status: CampaignStatusUpdateRequest['status']) => {
    if (!campaign) return;
    try {
      await updateStatus(campaign.id, status);
      if (status === 'Closed') {
        toast.success(
          <div>
            <p className="font-medium">{t('employer.campaigns.detail.endSuccessTitle')}</p>
            <p className="text-sm">{t('employer.campaigns.detail.endSuccessDescription')}</p>
          </div>,
        );
      } else {
        toast.success(t('employer.campaigns.detail.archiveSuccess'));
      }
      reload();
    } catch (error) {
      if (status === 'Closed') {
        throw error;
      }
      const code = campaignManagementService.getErrorStatus(error);
      toast.error(
        t(
          code === 409
            ? 'employer.campaigns.detail.statusConflict'
            : 'employer.campaigns.detail.archiveFailed',
        ),
      );
      throw new Error('STATUS_UPDATE_FAILED');
    }
  };

  const handleDelete = async () => {
    if (!campaign) return;
    try {
      await deleteCampaign(campaign.id);
      toast.success(t('employer.campaigns.detail.deleteSuccess'));
      navigate('/employer/campaigns', { replace: true });
    } catch {
      toast.error(t('employer.campaigns.detail.deleteFailed'));
      throw new Error('DELETE_FAILED');
    }
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto bg-surface-base">
        <div className="page-container page-section mx-auto max-w-6xl space-y-3" aria-busy="true">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (isError && errorStatus === 403) {
    return (
      <DetailShell>
        <EmptyState
          variant="no-permission"
          title={t('employer.campaigns.detail.forbiddenTitle')}
          description={t('employer.campaigns.detail.forbiddenDescription')}
          action={
            <Link to="/employer/campaigns" className="btn-secondary inline-flex">
              {t('employer.campaigns.detail.back')}
            </Link>
          }
        />
      </DetailShell>
    );
  }

  if ((isError && (errorStatus === 404 || errorStatus === 400)) || (!isError && !campaign)) {
    return (
      <DetailShell>
        <EmptyState
          variant="no-results"
          title={t('employer.campaigns.detail.notFoundTitle')}
          description={t('employer.campaigns.detail.notFoundDescription')}
          action={
            <Link to="/employer/campaigns" className="btn-secondary inline-flex">
              {t('employer.campaigns.detail.back')}
            </Link>
          }
        />
      </DetailShell>
    );
  }

  if (isError && errorStatus !== 401) {
    return (
      <DetailShell>
        <EmptyState
          variant="no-results"
          title={t('employer.campaigns.detail.errorTitle')}
          description={t('employer.campaigns.detail.errorDescription')}
          action={
            <Button type="button" onClick={reload}>
              {t('employer.campaigns.detail.retry')}
            </Button>
          }
        />
      </DetailShell>
    );
  }

  if (!campaign) return null;

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-[1440px] space-y-5">
        <CampaignContextHeader
          campaign={campaign}
          mode="overview"
          onEndCampaign={() => handleChangeStatus('Closed')}
        />
        <div className="motion-safe:animate-in motion-safe:fade-in">
          <div hidden={tab !== 'details'}>
            <CampaignDetailView
              campaign={campaign}
              published={published}
              warnings={warnings}
              onPublish={handlePublish}
              onChangeStatus={handleChangeStatus}
              onDelete={handleDelete}
              embedded
            />
          </div>
          <div hidden={tab !== 'results'}>
            <CampaignResultsPanel
              campaignId={campaign.id}
              passScorePct={campaign.passScorePct}
              enabled
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-6xl space-y-6">
        <Link to="/employer/campaigns" className="text-sm text-muted-foreground hover:text-foreground">
          {t('employer.campaigns.detail.back')}
        </Link>
        {children}
      </div>
    </div>
  );
}
