import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import { useQueryClient } from '@tanstack/react-query';
import { deployCampaignAndSyncCache, useEmployerCampaign } from '../hooks/useEmployerCampaigns';
import { CampaignWizardForm } from '../components/wizard/CampaignWizardForm';
import type {
  CampaignCreateQuestionRequest,
  CampaignCreateRequest,
  CampaignQuestionImportResult,
  CampaignUpdateRequest,
  GenerateCampaignQuestionsParams,
} from '../types/campaign.api.types';
import type { CampaignDeployOptions } from '../types/campaignManagement.types';
import { campaignManagementService } from '../services/campaignManagement.service';

export function parseWizardStepParam(raw: string | null): number | undefined {
  if (raw == null || !/^\d+$/.test(raw)) return undefined;
  const oneBased = Number(raw);
  return oneBased >= 1 ? oneBased - 1 : undefined;
}

/** `?question=<id>` (SC2 · T9) — id câu hỏi cần mở ở bước 4; rỗng/rác ⇒ không mở gì (id lạ đã bị Sections bỏ qua). */
export function parseWizardQuestionParam(raw: string | null): string | null {
  const value = raw?.trim() ?? '';
  return value ? value : null;
}

export function CampaignWizardPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const {
    campaign,
    isLoading,
    isError,
    errorStatus,
    createCampaign,
    updateCampaign,
    updateCampaignQuestions,
    uploadFiles,
    replaceFiles,
    downloadFile,
    reload,
  } = useEmployerCampaign(id);
  const mode = id ? 'edit' : 'create';
  const isEditing = mode === 'edit';
  // `?step=3` = "Bước 3/8" như người dùng thấy (1-based); hook nhận 0-based. Rác/ngoài dải ⇒ bỏ qua, mở bước 1.
  const initialStep = parseWizardStepParam(searchParams.get('step'));
  const initialQuestionId = parseWizardQuestionParam(searchParams.get('question'));

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

  const handleGenerateQuestions = async (params: GenerateCampaignQuestionsParams) => {
    return campaignManagementService.generateCampaignQuestions(params);
  };

  const handleImportQuestions = async (campaignId: string, file: File): Promise<CampaignQuestionImportResult> => {
    return campaignManagementService.importCampaignQuestions(campaignId, file);
  };

  const handleUploadFiles = async (
    campaignId: string,
    files: { jdFile?: File | null; criteriaFile?: File | null },
  ) => {
    return uploadFiles(campaignId, files);
  };

  const handleReplaceFiles = async (
    campaignId: string,
    files: { jdFile?: File | null; criteriaFile?: File | null },
  ) => {
    return replaceFiles(campaignId, files);
  };

  const handleDownloadFile = async (campaignId: string, fileType: 'jd' | 'criteria') => {
    return downloadFile(campaignId, fileType);
  };

  const handleDeployCampaign = async (campaignId: string, emails: string[], options?: CampaignDeployOptions) => {
    // Đồng bộ cache chi tiết ngay sau deploy — xem chú thích tại deployCampaignAndSyncCache.
    return deployCampaignAndSyncCache(queryClient, campaignId, emails, options);
  };

  const handleSendInvitations = async (campaignId: string, emails: string[]) => {
    return campaignManagementService.createCampaignInvitations(campaignId, { emails });
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
      initialStep={initialStep}
      initialQuestionId={initialQuestionId}
      onCreateCampaign={handleCreateCampaign}
      onUpdateCampaign={handleUpdateCampaign}
      onUpdateQuestions={handleUpdateQuestions}
      onGenerateQuestions={handleGenerateQuestions}
      onImportQuestions={handleImportQuestions}
      onUploadFiles={handleUploadFiles}
      onReplaceFiles={handleReplaceFiles}
      onDownloadFile={handleDownloadFile}
      onAfterSubmit={(next) => goToDetail(next.id)}
      onDeployCampaign={handleDeployCampaign}
      onSendInvitations={handleSendInvitations}
    />
  );
}
