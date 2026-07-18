import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/shared/languages';
import { useCampaignWizard } from '../../hooks/useCampaignWizard';
import type { CampaignDraftInput, EmployerCampaign } from '../../types/campaignManagement.types';
import { CAMPAIGN_WIZARD_STEP_COUNT } from './campaignWizard.steps';
import { CampaignCriteriaStepV2 } from './CampaignCriteriaStepV2';
import { CampaignEmailStep } from './CampaignEmailStep';
import { CampaignFinalReviewStep } from './CampaignFinalReviewStep';
import { CampaignInfoStep } from './CampaignInfoStep';
import { CampaignInviteMethodStep } from './CampaignInviteMethodStep';
import { CampaignJdStep } from './CampaignJdStep';
import { CampaignMagicLinkStep } from './CampaignMagicLinkStep';
import { CampaignPublishStep } from './CampaignPublishStep';
import { CampaignQuestionsStep } from './CampaignQuestionsStep';
import { CampaignRankingStep } from './CampaignRankingStep';
import { CampaignWizardShell } from './CampaignWizardShell';

interface CampaignWizardFormProps {
  campaign?: EmployerCampaign | null;
  isEditing?: boolean;
  onSaveDraft: (input: CampaignDraftInput) => Promise<EmployerCampaign>;
  onPublish: (input: CampaignDraftInput) => Promise<EmployerCampaign>;
}

export function CampaignWizardForm({
  campaign,
  isEditing = false,
  onSaveDraft,
  onPublish,
}: CampaignWizardFormProps) {
  const { t } = useLanguage();
  const wizard = useCampaignWizard({ campaign, onSaveDraft, onPublish });
  const { state, step } = wizard;
  const progressPercent = Math.round(((step + 1) / CAMPAIGN_WIZARD_STEP_COUNT) * 100);
  const stepError = wizard.stepError;

  return (
    <CampaignWizardShell
      currentStep={step}
      errorSteps={wizard.errorSteps}
      campaignName={state.info.title}
      progressPercent={progressPercent}
      isEditing={isEditing}
      autosaveStatus={state.autosaveStatus}
      lastSavedAt={state.lastSavedAt}
      onSaveDraft={() => void wizard.handleSaveDraft()}
      isSaving={wizard.isSaving}
    >
      {wizard.saved ? (
        <Alert variant="success" className="mb-4">
          <AlertDescription>{t('employer.campaigns.wizard.saved')}</AlertDescription>
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
          error={stepError}
          onChange={wizard.patchInfo}
          onNext={wizard.goNext}
          onSaveDraft={() => void wizard.handleSaveDraft()}
          isSaving={wizard.isSaving}
        />
      ) : null}

      {step === 1 ? (
        <CampaignJdStep
          jd={state.jd}
          error={stepError}
          onUpload={wizard.simulateJdUpload}
          onChange={wizard.patchJd}
          onRetryAnalyze={() => {
            const name = state.jd.fileName || 'retry.txt';
            wizard.simulateJdUpload(new File([''], name));
          }}
          onManualEntry={() => wizard.patchJd({ status: 'ready' })}
          onBack={wizard.goBack}
          onNext={wizard.goNext}
          onSaveDraft={() => void wizard.handleSaveDraft()}
          isSaving={wizard.isSaving}
        />
      ) : null}

      {step === 2 ? (
        <CampaignCriteriaStepV2
          rubricSource={state.rubricSource}
          rubric={state.rubric}
          totalWeight={wizard.totalWeight}
          rubricSavedAt={state.rubricSavedAt}
          error={stepError}
          onSelectSource={wizard.setRubricSource}
          onGenerateAi={wizard.generateRubricWithAi}
          onChangeRubric={wizard.setRubric}
          onSaveRubric={wizard.saveRubric}
          onBack={wizard.goBack}
          onNext={wizard.goNext}
          onSaveDraft={() => void wizard.handleSaveDraft()}
          isSaving={wizard.isSaving}
        />
      ) : null}

      {step === 3 ? (
        <CampaignQuestionsStep
          questionSource={state.questionSource}
          questionCount={state.questionCount}
          questions={state.questions}
          error={stepError}
          onSelectSource={wizard.setQuestionSource}
          onQuestionCount={wizard.setQuestionCount}
          onGenerateAi={wizard.generateQuestionsWithAi}
          onChangeQuestions={wizard.setQuestions}
          onBack={wizard.goBack}
          onNext={wizard.goNext}
          onSaveDraft={() => void wizard.handleSaveDraft()}
          isSaving={wizard.isSaving}
        />
      ) : null}

      {step === 4 ? (
        <CampaignInviteMethodStep
          method={state.candidateMethod}
          emails={state.candidateEmails}
          error={stepError}
          onSelectMethod={wizard.setCandidateMethod}
          onEmailsChange={wizard.setCandidateEmails}
          onSimulateCvRanking={wizard.simulateCvRanking}
          onBack={wizard.goBack}
          onNext={wizard.goNext}
          onSaveDraft={() => void wizard.handleSaveDraft()}
          isSaving={wizard.isSaving}
        />
      ) : null}

      {step === 5 ? (
        <CampaignRankingStep
          ranked={state.rankedCandidates}
          threshold={state.matchThreshold}
          error={stepError}
          onThreshold={wizard.setMatchThreshold}
          onSimulateCvRanking={wizard.simulateCvRanking}
          onToggleCandidate={(id) =>
            wizard.setRankedCandidates(
              state.rankedCandidates.map((row) =>
                row.id === id ? { ...row, selected: !row.selected } : row,
              ),
            )
          }
          onSelectAboveThreshold={() =>
            wizard.setRankedCandidates(
              state.rankedCandidates.map((row) => ({
                ...row,
                selected: row.overallMatch >= state.matchThreshold,
              })),
            )
          }
          onBack={wizard.goBack}
          onNext={wizard.goNext}
          onSaveDraft={() => void wizard.handleSaveDraft()}
          isSaving={wizard.isSaving}
        />
      ) : null}

      {step === 6 ? (
        <CampaignMagicLinkStep
          magicLink={state.magicLink}
          error={stepError}
          onGenerate={wizard.generateMagicLink}
          onBack={wizard.goBack}
          onNext={wizard.goNext}
          onSaveDraft={() => void wizard.handleSaveDraft()}
          isSaving={wizard.isSaving}
        />
      ) : null}

      {step === 7 ? (
        <CampaignEmailStep
          email={state.invitationEmail}
          error={stepError}
          onChange={(patch) =>
            wizard.setInvitationEmail({ ...state.invitationEmail, ...patch })
          }
          onBack={wizard.goBack}
          onNext={wizard.goNext}
          onSaveDraft={() => void wizard.handleSaveDraft()}
          isSaving={wizard.isSaving}
        />
      ) : null}

      {step === 8 ? (
        <CampaignFinalReviewStep
          info={state.info}
          jd={state.jd}
          rubric={state.rubric}
          questions={state.questions}
          invitedCount={wizard.invitedEmails.length}
          magicLink={state.magicLink}
          email={state.invitationEmail}
          onEditStep={wizard.goToStep}
          onBack={wizard.goBack}
          onNext={wizard.goNext}
          onSaveDraft={() => void wizard.handleSaveDraft()}
          isSaving={wizard.isSaving}
        />
      ) : null}

      {step === 9 ? (
        <CampaignPublishStep
          info={state.info}
          questionCount={state.questions.length}
          invitedCount={wizard.invitedEmails.length}
          confirmed={state.publishConfirmed}
          error={stepError}
          publishError={wizard.publishError}
          onConfirmChange={wizard.setPublishConfirmed}
          onBack={wizard.goBack}
          onSaveDraft={() => void wizard.handleSaveDraft()}
          onPublish={() => void wizard.handlePublish()}
          isSaving={wizard.isSaving}
          isPublishing={wizard.isPublishing}
        />
      ) : null}
    </CampaignWizardShell>
  );
}
