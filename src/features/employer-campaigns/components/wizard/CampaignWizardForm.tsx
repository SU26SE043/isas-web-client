import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { useCampaignWizard, type CampaignFormMode } from '../../hooks/useCampaignWizard';
import type { EmployerCampaign } from '../../types/campaignManagement.types';
import type { CampaignCreateQuestionRequest, CampaignQuestionImportResult, CampaignCreateRequest, CampaignUpdateRequest, GenerateCampaignQuestionsParams } from '../../types/campaign.api.types';
import { CAMPAIGN_WIZARD_STEP_COUNT } from './campaignWizard.steps';
import { CampaignWizardShell } from './CampaignWizardShell';
import { CampaignWizardStepContent } from './CampaignWizardStepContent';

interface CampaignWizardFormProps {
  campaign?: EmployerCampaign | null;
  mode: CampaignFormMode;
  onCreateCampaign: (input: CampaignCreateRequest) => Promise<EmployerCampaign>;
  onUpdateCampaign: (campaignId: string, payload: CampaignUpdateRequest) => Promise<EmployerCampaign>;
  onUpdateQuestions: (campaignId: string, questions: CampaignCreateQuestionRequest[]) => Promise<EmployerCampaign>;
  onGenerateQuestions: (params: GenerateCampaignQuestionsParams) => Promise<EmployerCampaign>;
  onImportQuestions: (campaignId: string, file: File) => Promise<CampaignQuestionImportResult>;
  onUploadFiles: (campaignId: string, files: { jdFile?: File | null; criteriaFile?: File | null }) => Promise<EmployerCampaign>;
  onReplaceFiles: (campaignId: string, files: { jdFile?: File | null; criteriaFile?: File | null }) => Promise<EmployerCampaign>;
  onDownloadFile: (campaignId: string, fileType: 'jd' | 'criteria') => Promise<import('../../utils/campaignFiles').BlobDownloadResult>;
  onAfterSubmit: (campaign: EmployerCampaign) => void;
  onDeployCampaign: (campaignId: string, emails: string[]) => Promise<import('../../types/campaignManagement.types').CampaignDeployResult>;
  onSendInvitations: (campaignId: string, emails: string[]) => Promise<import('../../types/campaign.api.types').CreateCampaignInvitationsResponse>;
}

export function CampaignWizardForm({ campaign, mode, onCreateCampaign, onUpdateCampaign, onUpdateQuestions, onGenerateQuestions, onImportQuestions, onUploadFiles, onReplaceFiles, onDownloadFile, onAfterSubmit, onDeployCampaign, onSendInvitations }: CampaignWizardFormProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const wizard = useCampaignWizard({ campaign, mode, onCreateCampaign, onUpdateCampaign, onUpdateQuestions, onGenerateQuestions, onImportQuestions, onUploadFiles, onReplaceFiles, onDownloadFile, onAfterSubmit, onDeployCampaign, onSendInvitations });
  const { state, step } = wizard;
  const finalSubmitLabel = t('employer.campaigns.wizard.deploy.action');
  const finalLoadingLabel = t('employer.campaigns.wizard.deploy.deploying');
  return <CampaignWizardShell currentStep={step} errorSteps={wizard.errorSteps} campaignName={state.info.title} progressPercent={Math.round(((step + 1) / CAMPAIGN_WIZARD_STEP_COUNT) * 100)} isEditing={mode === 'edit'} autosaveStatus={state.autosaveStatus} lastSavedAt={state.lastSavedAt} completedSteps={wizard.completedSteps} onStepChange={wizard.goToStep}>
    <CampaignWizardStepContent campaign={campaign} wizard={wizard} onCancel={() => navigate('/employer/campaigns')} finalSubmitLabel={finalSubmitLabel} finalLoadingLabel={finalLoadingLabel} />
  </CampaignWizardShell>;
}
