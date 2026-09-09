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
}

export function CampaignWizardStepContent({ campaign, wizard, onCancel, finalSubmitLabel, finalLoadingLabel }: CampaignWizardStepContentProps) {
  const { t } = useLanguage();
  const { state, step } = wizard;
  return <>
    {wizard.actionError ? <Alert variant="error" className="mb-4"><AlertDescription className="flex flex-wrap items-center justify-between gap-3"><span>{wizard.actionError}</span>{wizard.metadataSaved && !wizard.questionsSaved ? <button type="button" className="btn-secondary text-sm" disabled={wizard.isSubmitting} onClick={() => void wizard.retryQuestionsUpdate()}>{t('employer.campaigns.wizard.retryQuestions')}</button> : null}{wizard.partialDeploy ? <button type="button" className="btn-secondary text-sm" disabled={wizard.isSubmitting} onClick={() => void wizard.retryDeployInvitations()}>{t('employer.campaigns.wizard.deploy.retryInvitations')}</button> : null}</AlertDescription></Alert> : null}
    {wizard.stepError ? <Alert variant="error" className="mb-4"><AlertDescription>{wizard.stepError}</AlertDescription></Alert> : null}
    {step === 0 ? <CampaignInfoStep info={state.info} error={wizard.stepError} onChange={wizard.patchInfo} onNext={wizard.goNext} onCancel={onCancel} isSaving={wizard.isSavingStep} /> : null}
    {step === 1 ? <CampaignJdStep jd={state.jd} error={wizard.stepError} canReplace={wizard.canReplaceFiles} onChange={wizard.patchJd} onSelectFile={wizard.selectJdFile} onRetryUpload={wizard.retryJdUpload} onDownload={wizard.downloadJdFile} onBack={wizard.goBack} onNext={wizard.goNext} isSaving={wizard.isSavingStep} /> : null}
    {step === 2 ? <CampaignCriteriaStepV2 rubric={state.rubric} campaignId={state.draftId ?? campaign?.id ?? null} jobCategory={wizard.jobCategory} language={state.info.language === 'en' ? 'en' : 'vi'} error={wizard.stepError} onChangeRubric={wizard.setRubric} onReset={wizard.resetRubric} onBack={wizard.goBack} onNext={wizard.goNext} isSaving={wizard.isSavingStep} /> : null}
    {step === 3 ? <CampaignQuestionsStep campaignTitle={state.info.title} isDraft={wizard.isDraftEditable} hasJd={hasWizardJd(state.jd) || Boolean(campaign?.jobDescription?.trim())} questions={state.questions} questionCount={state.questionCount} questionsPerSession={state.questionsPerSession} questionBankWarnings={campaign?.questionBankWarnings ?? []} error={wizard.stepError} onQuestionCount={wizard.setQuestionCount} onQuestionsPerSession={wizard.setQuestionsPerSession} onGenerateAi={(opts) => void wizard.generateQuestionsWithAi(opts)} onImportCsv={wizard.importQuestionsFromCsv} onConfirmImport={wizard.appendImportedQuestions} onAddManual={wizard.addManualQuestion} onChangePrompt={(id, prompt) => wizard.updateQuestion(id, { prompt })} onToggleRequired={(id, isRequired) => wizard.updateQuestion(id, { isRequired })} onChangeGroup={(id, questionGroup) => wizard.updateQuestion(id, { questionGroup })} onMoveQuestion={wizard.moveQuestion} onRemoveQuestion={wizard.removeQuestion} onBack={wizard.goBack} onNext={wizard.goNext} isGenerating={wizard.isGeneratingQuestions} isSaving={wizard.isSavingQuestions || wizard.isSavingStep} /> : null}
    {step === 4 ? <CampaignSettingsStep settings={state.settings} error={wizard.stepError} onChange={wizard.patchSettings} onBack={wizard.goBack} onNext={wizard.goNext} isSaving={wizard.isSavingStep} questionCount={state.questionsPerSession ?? state.questions.length} /> : null}
    {step === 5 && state.draftId ? <CampaignSlotsStep campaignId={state.draftId} onBack={wizard.goBack} onNext={wizard.goNext} /> : null}
    {step === 6 ? <CampaignInvitesStep campaignId={state.draftId ?? campaign?.id ?? null} campaign={campaign} timeLimitMinutes={state.info.timeLimitMinutes} jdText={state.jd.jdText || state.jd.extractedText || campaign?.jobDescription || ''} hardFilters={state.hardFilters} inviteEmails={state.inviteEmails} onHardFiltersChange={wizard.patchHardFilters} onInviteEmailsChange={wizard.setInviteEmails} onBack={wizard.goBack} onNext={wizard.goNext} /> : null}
    {step === 7 ? <CampaignReviewStep info={state.info} jd={state.jd} rubric={state.rubric} questions={state.questions} questionsPerSession={state.questionsPerSession} settings={state.settings} campaignId={state.draftId} domainLabel={wizard.domainLabel} inviteEmails={state.inviteEmails} questionBankWarnings={campaign?.questionBankWarnings ?? []} error={wizard.stepError} onGoToStep={wizard.goToStep} onBack={wizard.goBack} onSubmit={wizard.handleFinalSubmit} submitLabel={finalSubmitLabel} submittingLabel={finalLoadingLabel} isSubmitting={wizard.isSubmitting} submitDisabled={!wizard.isDraftEditable} disableForBlockingIssues /> : null}
  </>;
}
