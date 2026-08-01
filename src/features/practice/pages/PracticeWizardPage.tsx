import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { PracticeWizardShell } from '../components/wizard/PracticeWizardShell';
import { PracticeJobCategoryStep } from '../components/wizard/PracticeJobCategoryStep';
import { PracticeCvOptionalStep } from '../components/wizard/PracticeCvOptionalStep';
import { PracticeJdStep } from '../components/wizard/PracticeJdStep';
import { PracticeTimeLimitStep } from '../components/wizard/PracticeTimeLimitStep';
import { PracticeQuestionCountSetupStep } from '../components/wizard/PracticeQuestionCountSetupStep';
import { PracticeGradingCriteriaStep } from '../components/wizard/PracticeGradingCriteriaStep';
import { PracticeSetupSummaryStep } from '../components/wizard/PracticeSetupSummaryStep';
import { usePracticeSetupFlow } from '../hooks/usePracticeSetupFlow';

export function PracticeWizardPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const flow = usePracticeSetupFlow();
  const disabled = flow.isCreatingSession;

  return (
    <PracticeWizardShell currentStep={flow.step}>
      {flow.step === 0 ? (
        <PracticeJobCategoryStep
          value={flow.jobCategory}
          onSelect={flow.setJobCategory}
          onNext={() => flow.goToStep(1)}
          onBack={() => navigate('/candidate/dashboard')}
          disabled={disabled}
        />
      ) : null}

      {flow.step === 1 ? (
        <PracticeCvOptionalStep
          files={flow.cvFiles}
          selectedId={flow.cvId}
          isLoading={flow.loadingCv}
          isUploading={flow.uploadingCv}
          uploadError={flow.uploadError}
          disabled={disabled}
          onSelect={flow.setCvId}
          onUpload={(file) => void flow.handleUploadCv(file)}
          onBack={() => flow.goToStep(0)}
          onNext={() => flow.goToStep(2)}
        />
      ) : null}

      {flow.step === 2 ? (
        <PracticeJdStep
          tab={flow.jdTab}
          onTabChange={flow.setJdTab}
          files={flow.jdFiles}
          selectedJdId={flow.jdId}
          jdText={flow.jdText}
          isLoading={flow.loadingJd}
          disabled={disabled}
          textTooLong={flow.jdTextTooLong}
          onSelectJd={flow.setJdId}
          onJdTextChange={flow.setJdText}
          onBack={() => flow.goToStep(1)}
          onNext={() => flow.goToStep(3)}
        />
      ) : null}

      {flow.step === 3 ? (
        <PracticeTimeLimitStep
          value={flow.timeLimitSec}
          disabled={disabled}
          onSelect={flow.setTimeLimitSec}
          onBack={() => flow.goToStep(2)}
          onNext={() => flow.goToStep(4)}
        />
      ) : null}

      {flow.step === 4 ? (
        <PracticeQuestionCountSetupStep
          value={flow.questionCount}
          disabled={disabled}
          onChange={flow.setQuestionCount}
          onBack={() => flow.goToStep(3)}
          onNext={() => flow.goToStep(5)}
        />
      ) : null}

      {flow.step === 5 ? (
        <PracticeGradingCriteriaStep
          criteria={flow.rubricCriteria}
          selectedIds={flow.rubricCriterionIds}
          isLoading={flow.loadingRubric}
          isError={flow.rubricError}
          disabled={disabled}
          onSelect={flow.setRubricCriterionIds}
          onRetry={flow.retryRubric}
          onBack={() => flow.goToStep(4)}
          onNext={() => flow.goToStep(6)}
        />
      ) : null}

      {flow.step === 6 ? (
        <PracticeSetupSummaryStep
          jobCategory={flow.jobCategory}
          cvFile={flow.selectedCv}
          jdFile={flow.selectedJd}
          jdText={flow.jdText}
          jdTab={flow.jdTab}
          timeLimitSec={flow.timeLimitSec}
          questionCount={flow.questionCount}
          criteria={flow.rubricCriteria.filter((criterion) => flow.rubricCriterionIds.includes(criterion.id))}
          canStart={flow.canStart}
          isCreating={flow.isCreatingSession}
          errorCode={flow.createErrorCode}
          errorMessage={flow.createErrorMessage}
          onBack={() => flow.goToStep(5)}
          onEditCriteria={() => flow.goToStep(5)}
          onStart={() => void flow.handleStart()}
          onClearError={flow.clearCreateError}
        />
      ) : null}

      {flow.isCreatingSession ? (
        <div className="sr-only" aria-live="polite">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t('practice.setup.creating')}
        </div>
      ) : null}

      {flow.createErrorCode === 'insufficient_credit' && flow.step !== 6 ? (
        <div className="mt-4 rounded-xl border border-error/40 bg-surface-raised p-4 text-sm text-error">
          {t('practice.errors.insufficientCredit')}{' '}
          <Link to="/candidate/credits" className="underline">
            {t('practice.setup.buyCredit')}
          </Link>
        </div>
      ) : null}
    </PracticeWizardShell>
  );
}
