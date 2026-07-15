import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/shared/languages';
import { useCampaignWizard } from '../../hooks/useCampaignWizard';
import type {
  CampaignDraftInput,
  CampaignQuestion,
  EmployerCampaign,
} from '../../types/campaignManagement.types';
import { CampaignBasicInfoStep } from './CampaignBasicInfoStep';
import { CampaignCriteriaStep } from './CampaignCriteriaStep';
import { CampaignInterviewConfigStep } from './CampaignInterviewConfigStep';
import { CampaignJobDescriptionStep } from './CampaignJobDescriptionStep';
import { CampaignReviewStep } from './CampaignReviewStep';
import { CampaignSettingsStep } from './CampaignSettingsStep';
import { CampaignWizardShell } from './CampaignWizardShell';

interface CampaignWizardFormProps {
  campaign?: EmployerCampaign | null;
  questions: CampaignQuestion[];
  isEditing?: boolean;
  onSaveDraft: (input: CampaignDraftInput) => Promise<EmployerCampaign>;
  onPublish: (input: CampaignDraftInput) => Promise<EmployerCampaign>;
}

export function CampaignWizardForm({
  campaign,
  questions,
  isEditing = false,
  onSaveDraft,
  onPublish,
}: CampaignWizardFormProps) {
  const { t } = useLanguage();
  const wizard = useCampaignWizard({ campaign, questions, onSaveDraft, onPublish });
  const { form, step } = wizard;

  return (
    <CampaignWizardShell currentStep={step} isEditing={isEditing}>
      {wizard.saved ? (
        <Alert variant="success" className="mb-4">
          <AlertDescription>{t('employer.campaigns.wizard.saved')}</AlertDescription>
        </Alert>
      ) : null}

      {step === 0 ? (
        <CampaignBasicInfoStep
          register={form.register}
          errors={form.formState.errors}
          onNext={() => void wizard.goNext()}
          onSaveDraft={() => void wizard.handleSaveDraft()}
          isSaving={wizard.isSaving}
        />
      ) : null}

      {step === 1 ? (
        <CampaignJobDescriptionStep
          register={form.register}
          errors={form.formState.errors}
          onBack={wizard.goBack}
          onNext={() => void wizard.goNext()}
          onSaveDraft={() => void wizard.handleSaveDraft()}
          isSaving={wizard.isSaving}
        />
      ) : null}

      {step === 2 ? (
        <CampaignInterviewConfigStep
          register={form.register}
          errors={form.formState.errors}
          questions={questions}
          selectedIds={wizard.selectedQuestions}
          onToggleQuestion={wizard.toggleQuestion}
          questionError={wizard.questionError}
          onBack={wizard.goBack}
          onNext={() => void wizard.goNext()}
          onSaveDraft={() => void wizard.handleSaveDraft()}
          isSaving={wizard.isSaving}
        />
      ) : null}

      {step === 3 ? (
        <CampaignCriteriaStep
          rubric={wizard.rubric}
          onChangeWeight={wizard.changeWeight}
          onBack={wizard.goBack}
          onNext={() => void wizard.goNext()}
          onSaveDraft={() => void wizard.handleSaveDraft()}
          isSaving={wizard.isSaving}
        />
      ) : null}

      {step === 4 ? (
        <CampaignSettingsStep
          register={form.register}
          errors={form.formState.errors}
          proctoring={wizard.proctoring}
          onProctoringChange={wizard.setProctoring}
          onBack={wizard.goBack}
          onNext={() => void wizard.goNext()}
          onSaveDraft={() => void wizard.handleSaveDraft()}
          isSaving={wizard.isSaving}
        />
      ) : null}

      {step === 5 ? (
        <CampaignReviewStep
          values={wizard.watched}
          rubric={wizard.rubric}
          questions={wizard.chosenQuestions}
          proctoring={wizard.proctoring}
          publishError={wizard.publishError}
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
