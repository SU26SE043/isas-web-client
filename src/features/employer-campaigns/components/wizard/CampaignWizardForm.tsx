import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/shared/languages';
import { useCampaignWizard, type CampaignFormMode } from '../../hooks/useCampaignWizard';
import type { EmployerCampaign } from '../../types/campaignManagement.types';
import type {
  CampaignCreateQuestionRequest,
  CampaignCreateRequest,
  CampaignUpdateRequest,
  GenerateCampaignQuestionsParams,
} from '../../types/campaign.api.types';
import { CAMPAIGN_WIZARD_STEP_COUNT } from './campaignWizard.steps';
import { CampaignCriteriaStepV2 } from './CampaignCriteriaStepV2';
import { CampaignInfoStep } from './CampaignInfoStep';
import { CampaignJdStep } from './CampaignJdStep';
import { CampaignQuestionsStep } from './CampaignQuestionsStep';
import { CampaignReviewStep } from './CampaignReviewStep';
import { CampaignSettingsStep } from './CampaignSettingsStep';
import { CampaignSlotsStep } from './CampaignSlotsStep';
import { CampaignWizardShell } from './CampaignWizardShell';
import { hasWizardJd } from '../../utils/campaignQuestionLimits';

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
  onGenerateQuestions: (params: GenerateCampaignQuestionsParams) => Promise<EmployerCampaign>;
  onUploadFiles: (
    campaignId: string,
    files: { jdFile?: File | null; criteriaFile?: File | null },
  ) => Promise<EmployerCampaign>;
  onReplaceFiles: (
    campaignId: string,
    files: { jdFile?: File | null; criteriaFile?: File | null },
  ) => Promise<EmployerCampaign>;
  onDownloadFile: (
    campaignId: string,
    fileType: 'jd' | 'criteria',
  ) => Promise<import('../../utils/campaignFiles').BlobDownloadResult>;
  onAfterSubmit: (campaign: EmployerCampaign) => void;
}

export function CampaignWizardForm({
  campaign,
  mode,
  onCreateCampaign,
  onUpdateCampaign,
  onUpdateQuestions,
  onGenerateQuestions,
  onUploadFiles,
  onReplaceFiles,
  onDownloadFile,
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
    onGenerateQuestions,
    onUploadFiles,
    onReplaceFiles,
    onDownloadFile,
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
          hardFilters={state.hardFilters}
          isDraft={wizard.isDraftEditable}
          error={wizard.stepError}
          canReplace={wizard.canReplaceFiles}
          onChange={wizard.patchJd}
          onHardFiltersChange={wizard.patchHardFilters}
          onSelectFile={wizard.selectJdFile}
          onRetryUpload={wizard.retryJdUpload}
          onDownload={wizard.downloadJdFile}
          onBack={wizard.goBack}
          onNext={wizard.goNext}
          isSaving={wizard.isSavingStep}
        />
      ) : null}

      {step === 2 ? (
        <CampaignCriteriaStepV2
          rubric={state.rubric}
          campaignId={state.draftId ?? campaign?.id ?? null}
          jobCategory={wizard.jobCategory}
          contextLabel={
            wizard.domainLabel || state.info.title || t('employer.campaigns.wizard.steps.criteria')
          }
          error={wizard.stepError}
          onChangeRubric={wizard.setRubric}
          onReset={wizard.resetRubric}
          onBack={wizard.goBack}
          onNext={wizard.goNext}
          isSaving={wizard.isSavingStep}
        />
      ) : null}

      {step === 3 ? (
        <CampaignQuestionsStep
          campaignTitle={state.info.title}
          domainLabel={wizard.domainLabel}
          isDraft={wizard.isDraftEditable}
          hasJd={hasWizardJd(state.jd) || Boolean(campaign?.jobDescription?.trim())}
          questions={state.questions}
          questionCount={state.questionCount}
          questionsPerSession={state.questionsPerSession}
          maxQuestions={
            state.settings.maxQuestions > 0 ? state.settings.maxQuestions : null
          }
          error={wizard.stepError}
          onQuestionCount={wizard.setQuestionCount}
          onQuestionsPerSession={wizard.setQuestionsPerSession}
          onGenerateAi={(opts) => void wizard.generateQuestionsWithAi(opts)}
          onSaveQuestions={() => void wizard.saveQuestionsNow()}
          onAddManual={wizard.addManualQuestion}
          onChangePrompt={(id, prompt) => wizard.updateQuestion(id, { prompt })}
          onToggleRequired={(id, isRequired) => wizard.updateQuestion(id, { isRequired })}
          onChangeGroup={(id, questionGroup) => wizard.updateQuestion(id, { questionGroup })}
          onMoveQuestion={wizard.moveQuestion}
          onRemoveQuestion={wizard.removeQuestion}
          onBack={wizard.goBack}
          onNext={wizard.goNext}
          isGenerating={wizard.isGeneratingQuestions}
          isSaving={wizard.isSavingQuestions || wizard.isSavingStep}
          onOpenSettings={() => wizard.goToStep(4)}
        />
      ) : null}

      {step === 4 ? (
        <CampaignSettingsStep
          settings={state.settings}
          error={wizard.stepError}
          onChange={wizard.patchSettings}
          onBack={wizard.goBack}
          onNext={wizard.goNext}
          isSaving={wizard.isSavingStep}
          questionCount={state.questions.length}
        />
      ) : null}

      {step === 5 && state.draftId ? (
        <CampaignSlotsStep
          campaignId={state.draftId}
          onBack={wizard.goBack}
          onNext={wizard.goNext}
        />
      ) : null}

      {step === 6 ? (
        <CampaignReviewStep
          info={state.info}
          jd={state.jd}
          rubric={state.rubric}
          questions={state.questions}
          settings={state.settings}
          campaignId={state.draftId}
          domainLabel={wizard.domainLabel}
          error={wizard.stepError}
          onGoToStep={wizard.goToStep}
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
