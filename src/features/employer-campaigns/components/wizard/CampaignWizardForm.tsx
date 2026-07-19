import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/shared/languages';
import { useCampaignWizard, type CampaignFormMode } from '../../hooks/useCampaignWizard';
import type { EmployerCampaign } from '../../types/campaignManagement.types';
import type {
  CampaignCreateQuestionRequest,
  CampaignCreateRequest,
  CampaignUpdateRequest,
} from '../../types/campaign.api.types';
import { CAMPAIGN_WIZARD_STEP_COUNT } from './campaignWizard.steps';
import { CampaignCriteriaStepV2 } from './CampaignCriteriaStepV2';
import { CampaignInfoStep } from './CampaignInfoStep';
import { CampaignJdStep } from './CampaignJdStep';
import { CampaignQuestionsStep } from './CampaignQuestionsStep';
import { CampaignWizardShell } from './CampaignWizardShell';

interface CampaignWizardFormProps {
  campaign?: EmployerCampaign | null;
  mode: CampaignFormMode;
  onCreateCampaign: (input: CampaignCreateRequest) => Promise<EmployerCampaign>;
  onUpdateCampaign: (
    campaignId: string,
    payload: CampaignUpdateRequest,
  ) => Promise<EmployerCampaign>;
  onUpdateQuestions: (
    campaignId: string,
    questions: CampaignCreateQuestionRequest[],
  ) => Promise<EmployerCampaign>;
  onUploadFiles: (
    campaignId: string,
    files: { jdFile?: File | null; criteriaFile?: File | null },
    options?: { replace?: boolean },
  ) => Promise<EmployerCampaign>;
  onAfterSubmit: (campaign: EmployerCampaign) => void;
}

export function CampaignWizardForm({
  campaign,
  mode,
  onCreateCampaign,
  onUpdateCampaign,
  onUpdateQuestions,
  onUploadFiles,
  onAfterSubmit,
}: CampaignWizardFormProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const wizard = useCampaignWizard({
    campaign,
    mode,
    onCreateCampaign,
    onUpdateCampaign,
    onUpdateQuestions,
    onUploadFiles,
    onAfterSubmit,
  });
  const { state, step } = wizard;
  const progressPercent = Math.round(((step + 1) / CAMPAIGN_WIZARD_STEP_COUNT) * 100);
  const finalSubmitLabel =
    mode === 'edit'
      ? t('employer.campaigns.wizard.saveChanges')
      : t('employer.campaigns.wizard.createCampaign');
  const finalLoadingLabel =
    mode === 'edit'
      ? t('employer.campaigns.wizard.savingChanges')
      : t('employer.campaigns.wizard.creatingCampaign');

  return (
    <CampaignWizardShell
      currentStep={step}
      errorSteps={wizard.errorSteps}
      campaignName={state.info.title}
      progressPercent={progressPercent}
      isEditing={mode === 'edit'}
      autosaveStatus={state.autosaveStatus}
      lastSavedAt={state.lastSavedAt}
    >
      {wizard.actionError ? (
        <Alert variant="error" className="mb-4">
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>{wizard.actionError}</span>
            {wizard.metadataSaved && !wizard.questionsSaved ? (
              <button
                type="button"
                className="btn-secondary text-sm"
                disabled={wizard.isSubmitting}
                onClick={() => void wizard.retryQuestionsUpdate()}
              >
                {t('employer.campaigns.wizard.retryQuestions')}
              </button>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      {wizard.stepError ? (
        <Alert variant="error" className="mb-4">
          <AlertDescription>{wizard.stepError}</AlertDescription>
        </Alert>
      ) : null}

      {step === 0 ? (
        <CampaignInfoStep
          info={state.info}
          error={wizard.stepError}
          onChange={wizard.patchInfo}
          onNext={wizard.goNext}
          onCancel={() => navigate('/employer/campaigns')}
          isSaving={wizard.isSavingStep}
        />
      ) : null}

      {step === 1 ? (
        <CampaignJdStep
          jd={state.jd}
          error={wizard.stepError}
          onChange={wizard.patchJd}
          onUploadFile={(file) => void wizard.uploadJdFile(file)}
          onRetryUpload={wizard.retryJdUpload}
          onBack={wizard.goBack}
          onNext={wizard.goNext}
          isSaving={wizard.isSavingStep}
        />
      ) : null}

      {step === 2 ? (
        <CampaignCriteriaStepV2
          rubric={state.rubric}
          criteria={state.criteria}
          contextLabel={
            wizard.domainLabel || state.info.title || t('employer.campaigns.wizard.steps.criteria')
          }
          error={wizard.stepError}
          onChangeRubric={wizard.setRubric}
          onChangeCriteria={wizard.patchCriteria}
          onUploadFile={(file) => void wizard.uploadCriteriaFile(file)}
          onRetryUpload={wizard.retryCriteriaUpload}
          onReset={wizard.resetRubric}
          onBack={wizard.goBack}
          onNext={wizard.goNext}
          isSaving={wizard.isSavingStep}
        />
      ) : null}

      {step === 3 ? (
        <CampaignQuestionsStep
          questionSource={state.questionSource}
          questionCount={state.questionCount}
          questions={state.questions}
          error={wizard.stepError}
          onSelectSource={wizard.setQuestionSource}
          onQuestionCount={wizard.setQuestionCount}
          onGenerateAi={wizard.generateQuestionsWithAi}
          onChangeQuestions={wizard.setQuestions}
          onBack={wizard.goBack}
          onSubmit={wizard.handleFinalSubmit}
          submitLabel={finalSubmitLabel}
          submittingLabel={finalLoadingLabel}
          isSubmitting={wizard.isSubmitting}
          submitDisabled={!wizard.isDraftEditable}
        />
      ) : null}
    </CampaignWizardShell>
  );
}
