import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import { useEmployerCampaign } from '../hooks/useEmployerCampaigns';
import { CampaignWizardForm } from '../components/wizard/CampaignWizardForm';
import type {
  CampaignCreateQuestionRequest,
  CampaignCreateRequest,
  CampaignUpdateRequest,
} from '../types/campaign.api.types';

export function CampaignWizardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    campaign,
    isLoading,
    isError,
    errorStatus,
    createCampaign,
    updateCampaign,
    updateCampaignQuestions,
    reload,
  } = useEmployerCampaign(id);
  const mode = id ? 'edit' : 'create';
  const isEditing = mode === 'edit';

  const handleCreateCampaign = async (input: CampaignCreateRequest) => {
    return createCampaign(input);
  };

  const handleUpdateCampaign = async (campaignId: string, payload: CampaignUpdateRequest) => {
    return updateCampaign(campaignId, payload);
  };

  const handleUpdateQuestions = async (
    campaignId: string,
    questions: CampaignCreateQuestionRequest[],
  ) => {
    return updateCampaignQuestions(campaignId, questions);
  };

  const goToDetail = (campaignId: string) => {
    navigate(`/employer/campaigns/${campaignId}`, { replace: true });
  };

  if (isLoading && isEditing) {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center bg-surface-base p-8">
        <Skeleton className="h-96 w-full max-w-5xl" />
      </div>
    );
  }

  if (isEditing && isError && !campaign) {
    const notFound = errorStatus === 404 || errorStatus === 400;
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-2xl flex-col justify-center gap-4 p-8">
        <Alert variant="error">
          <AlertTitle>
            {notFound
              ? t('employer.campaigns.detail.notFoundTitle')
              : t('employer.campaigns.detail.errorTitle')}
          </AlertTitle>
          <AlertDescription>
            {notFound
              ? t('employer.campaigns.detail.notFoundDescription')
              : t('employer.campaigns.detail.errorDescription')}
          </AlertDescription>
        </Alert>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={() => reload()}>
            {t('employer.campaigns.detail.retry')}
          </button>
          <Link to="/employer/campaigns" className="btn-primary">
            {t('employer.campaigns.detail.back')}
          </Link>
        </div>
      </div>
    );
  }

  if (isEditing && campaign && campaign.status !== 'draft') {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-2xl flex-col justify-center gap-4 p-8">
        <Alert variant="warning">
          <AlertTitle>{t('employer.campaigns.wizard.notDraftEditable')}</AlertTitle>
          <AlertDescription>
            {t('employer.campaigns.wizard.notDraftEditableDescription')}
          </AlertDescription>
        </Alert>
        <Link to={`/employer/campaigns/${campaign.id}`} className="btn-primary inline-flex w-fit">
          {t('employer.campaigns.detail.back')}
        </Link>
      </div>
    );
  }

  return (
    <CampaignWizardForm
      campaign={campaign}
      mode={mode}
      onCreateCampaign={handleCreateCampaign}
      onUpdateCampaign={handleUpdateCampaign}
      onUpdateQuestions={handleUpdateQuestions}
      onAfterSubmit={(next) => goToDetail(next.id)}
    />
  );
}
