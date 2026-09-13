import { useLanguage } from '@/shared/languages';
import type { EmployerCampaign } from '../../types/campaignManagement.types';
import type { CampaignWizardController } from '../../hooks/useCampaignWizard';
import { hasWizardJd } from '../../utils/campaignQuestionLimits';
import { CampaignCriteriaStepV2 } from './CampaignCriteriaStepV2';
import { CampaignInfoStep } from './CampaignInfoStep';
import { CampaignInvitesStep } from './CampaignInvitesStep';
import { CampaignJdStep } from './CampaignJdStep';
import { CampaignQuestionsStep } from './CampaignQuestionsStep';
import { CampaignReviewStep } from './CampaignReviewStep';
import { CampaignSettingsStep } from './CampaignSettingsStep';
import { CampaignSlotsStep } from './CampaignSlotsStep';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CampaignWizardStepContentProps {
  campaign?: EmployerCampaign | null;
  wizard: CampaignWizardController;
  onCancel: () => void;
  finalSubmitLabel: string;
  finalLoadingLabel: string;
  /** Deep-link `?question=<id>` (cùng `?step=4`): mở đúng card câu hỏi ở bước 4. */
  initialQuestionId?: string | null;
}

export function CampaignWizardStepContent({ campaign, wizard, onCancel, finalSubmitLabel, finalLoadingLabel, initialQuestionId }: CampaignWizardStepContentProps) {
  const { t } = useLanguage();
  const { state, step } = wizard;
  // SC2 · T9 — ngữ cảnh chấm thử THEO CÂU ở bước 4 (D-1: rời card bước 3). `beforeRun` = persistForPreview
  // (lưu thước đo + câu hỏi rồi mới POST); `resolveQuestionId` tra id server cho câu vừa được lưu.
  const questionPreview = {
    campaignId: state.draftId ?? campaign?.id ?? null,
    campaignStatus: wizard.campaignStatus ?? null,
    rubric: state.rubric,
    passScorePct: state.info.passScorePct ?? null,
    currentRubricVersion: campaign?.rubricVersion ?? null,
    beforeRun: wizard.persistForPreview,
    resolveQuestionId: wizard.resolveQuestionId,
    onGoToCriteria: () => wizard.goToStep(2),
  };
  const isPartialDeploy = Boolean(wizard.partialDeploy);
  const canRetryInvitations = wizard.canRetryInvitations !== false;
  const submitLabel = isPartialDeploy && canRetryInvitations
    ? t('employer.campaigns.wizard.deploy.retryInvitations')
    : isPartialDeploy
      ? t('employer.campaigns.wizard.deploy.invitationFixRequired')
      : finalSubmitLabel;
  const loadingLabel = isPartialDeploy && canRetryInvitations
    ? t('employer.campaigns.wizard.deploy.retryingInvitations')
    : finalLoadingLabel;
  const handleFinalAction = () => {
    if (isPartialDeploy) {
      if (!canRetryInvitations) return;
      void wizard.retryDeployInvitations();
      return;
    }
    void wizard.handleFinalSubmit();
  };
  return <>
    {wizard.actionError && !wizard.partialDeploy ? <Alert variant="error" className="mb-4"><AlertDescription className="flex flex-wrap items-center justify-between gap-3"><span>{wizard.actionError}</span>{wizard.metadataSaved && !wizard.questionsSaved ? <button type="button" className="btn-secondary text-sm" disabled={wizard.isSubmitting} onClick={() => void wizard.retryQuestionsUpdate()}>{t('employer.campaigns.wizard.retryQuestions')}</button> : null}</AlertDescription></Alert> : null}
    {wizard.stepError ? <Alert variant="error" className="mb-4"><AlertDescription>{wizard.stepError}</AlertDescription></Alert> : null}
    {step === 0 ? <CampaignInfoStep info={state.info} error={wizard.stepError} onChange={wizard.patchInfo} onNext={wizard.goNext} onCancel={onCancel} isSaving={wizard.isSavingStep} /> : null}
    {step === 1 ? <CampaignJdStep jd={state.jd} error={wizard.stepError} canReplace={wizard.canReplaceFiles} onChange={wizard.patchJd} onSelectFile={wizard.selectJdFile} onRetryUpload={wizard.retryJdUpload} onDownload={wizard.downloadJdFile} onBack={wizard.goBack} onNext={wizard.goNext} isSaving={wizard.isSavingStep} /> : null}
    {step === 2 ? <CampaignCriteriaStepV2 passScorePct={state.info.passScorePct} onPassScoreChange={(passScorePct) => wizard.patchInfo({ passScorePct })} rubric={state.rubric} customized={state.rubricCustomized} onCustomize={wizard.customizeRubric} campaignId={state.draftId ?? campaign?.id ?? null} jobCategory={wizard.jobCategory} language={state.info.language === 'en' ? 'en' : 'vi'} error={wizard.stepError} onChangeRubric={wizard.setRubric} onReset={wizard.resetRubric} onBack={wizard.goBack} onNext={wizard.goNext} isSaving={wizard.isSavingStep} onBeforeRun={wizard.persistForPreview} /> : null}
    {step === 3 ? <CampaignQuestionsStep campaignTitle={state.info.title} isDraft={wizard.isDraftEditable} hasJd={hasWizardJd(state.jd) || Boolean(campaign?.jobDescription?.trim())} questions={state.questions} questionCount={state.questionCount} questionsPerSession={state.questionsPerSession} questionBankWarnings={campaign?.questionBankWarnings ?? []} error={wizard.stepError} onQuestionCount={wizard.setQuestionCount} onQuestionsPerSession={wizard.setQuestionsPerSession} onGenerateAi={(opts) => void wizard.generateQuestionsWithAi(opts)} onImportCsv={wizard.importQuestionsFromCsv} onConfirmImport={wizard.appendImportedQuestions} onAddManual={wizard.addManualQuestion} onChangePrompt={(id, prompt) => wizard.updateQuestion(id, { prompt })} onToggleRequired={(id, isRequired) => wizard.updateQuestion(id, { isRequired })} onChangeGroup={(id, questionGroup) => wizard.updateQuestion(id, { questionGroup })} onMoveQuestion={wizard.moveQuestion} onRemoveQuestion={wizard.removeQuestion} onBack={wizard.goBack} onNext={wizard.goNext} isGenerating={wizard.isGeneratingQuestions} isSaving={wizard.isSavingQuestions || wizard.isSavingStep} rubric={state.rubric} onChangeTargets={(id, targetCriterionIds) => wizard.updateQuestion(id, { targetCriterionIds })} onChangeSampleAnswer={(id, sampleAnswer) => wizard.updateQuestion(id, { sampleAnswer })} onGoToCriteria={() => wizard.goToStep(2)} preview={questionPreview} coverageWarnings={campaign?.questionBank?.coverageWarnings ?? []} initialOpenQuestionId={initialQuestionId} /> : null}
    {step === 4 ? <CampaignSettingsStep settings={state.settings} error={wizard.stepError} onChange={wizard.patchSettings} onBack={wizard.goBack} onNext={wizard.goNext} isSaving={wizard.isSavingStep} questionCount={state.questionsPerSession ?? state.questions.length} /> : null}
    {step === 5 ? <CampaignSlotsStep campaignId={state.draftId ?? campaign?.id ?? null} maxCandidates={state.info.maxCandidates} campaignStartsAt={state.info.startsAt} campaignExpiresAt={state.info.expiresAt} error={wizard.stepError} onMaxCandidatesChange={(maxCandidates) => wizard.patchInfo({ maxCandidates })} onBack={wizard.goBack} onNext={wizard.goNext} /> : null}
    {step === 6 ? <CampaignInvitesStep campaignId={state.draftId ?? campaign?.id ?? null} campaign={campaign} timeLimitMinutes={state.info.timeLimitMinutes} onTimeLimitChange={(timeLimitMinutes) => wizard.patchInfo({ timeLimitMinutes: timeLimitMinutes ?? 0 })} error={wizard.stepError} jdText={state.jd.jdText || state.jd.extractedText || campaign?.jobDescription || ''} hardFilters={state.hardFilters} inviteEmails={state.inviteEmails} onHardFiltersChange={wizard.patchHardFilters} onInviteEmailsChange={wizard.setInviteEmails} onBack={wizard.goBack} onNext={wizard.goNext} /> : null}
    {step === 7 ? <CampaignReviewStep info={state.info} jd={state.jd} rubric={state.rubric} questions={state.questions} questionsPerSession={state.questionsPerSession} settings={state.settings} campaignId={state.draftId} domainLabel={wizard.domainLabel} inviteEmails={state.inviteEmails} questionBankWarnings={campaign?.questionBankWarnings ?? []} error={wizard.stepError} onGoToStep={wizard.goToStep} onBack={wizard.goBack} onSubmit={handleFinalAction} submitLabel={submitLabel} submittingLabel={loadingLabel} isSubmitting={wizard.isSubmitting} submitDisabled={!wizard.isDraftEditable} disableForBlockingIssues hasPartialDeploy={isPartialDeploy} invitationFailures={wizard.invitationFailures} invitationFailureReason={wizard.invitationFailureReason} canRetryInvitations={canRetryInvitations} onRetryInvitations={canRetryInvitations ? handleFinalAction : undefined} /> : null}
  </>;
}
