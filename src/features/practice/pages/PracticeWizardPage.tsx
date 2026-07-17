import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { PRACTICE_RESERVE_ESTIMATE } from '@/features/payment/constants';
import { PracticeWizardShell } from '../components/wizard/PracticeWizardShell';
import { PracticeDomainStep } from '../components/wizard/PracticeDomainStep';
import { PracticeLevelStep } from '../components/wizard/PracticeLevelStep';
import { PracticeCvStep } from '../components/wizard/PracticeCvStep';
import { PracticeQuestionCountStep } from '../components/wizard/PracticeQuestionCountStep';
import { PracticeRubricStep } from '../components/wizard/PracticeRubricStep';
import { PracticeConfirmStep } from '../components/wizard/PracticeConfirmStep';
import { usePracticeWizardFlow } from '../hooks/usePracticeWizardFlow';

export function PracticeWizardPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const flow = usePracticeWizardFlow();

  if (flow.submitError === 'insufficient') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base px-4">
        <div className="w-full max-w-md space-y-4 rounded-xl border border-subtle bg-surface-raised p-6 text-center">
          <h1 className="heading-primary text-xl text-foreground">{t('payment.wallet.insufficientTitle')}</h1>
          <p className="body-text text-sm text-muted-foreground">
            {t('payment.wallet.insufficientReserve').replace('{amount}', PRACTICE_RESERVE_ESTIMATE.toLocaleString())}
          </p>
          <Link to="/candidate/credits" className="btn-primary inline-flex">
            {t('payment.wallet.buyTokens')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PracticeWizardShell currentStep={flow.step}>
      {flow.submitError === 'generic' ? (
        <p className="mb-4 text-sm text-error" role="alert">
          {t('practice.wizard.confirm.error')}
        </p>
      ) : null}

      {flow.step === 0 ? (
        <PracticeDomainStep
          domains={flow.domains}
          selectedId={flow.domainId}
          isLoading={flow.loadingDomains}
          onSelect={flow.setDomainId}
          onNext={() => flow.goToStep(1)}
          onBack={() => navigate('/candidate/dashboard')}
        />
      ) : null}

      {flow.step === 1 ? (
        <PracticeLevelStep
          levels={flow.levels}
          selectedLevel={flow.level}
          onSelect={flow.setLevel}
          onBack={() => flow.goToStep(0)}
          onNext={() => flow.goToStep(2)}
        />
      ) : null}

      {flow.step === 2 ? (
        <PracticeCvStep
          files={flow.cvFiles}
          selectedId={flow.cvFileId}
          isLoading={flow.loadingCv}
          isUploading={flow.uploadingCv}
          uploadError={flow.uploadError}
          onSelect={flow.setCvFileId}
          onUpload={(file) => void flow.handleUploadCv(file)}
          onBack={() => flow.goToStep(1)}
          onNext={() => flow.goToStep(3)}
        />
      ) : null}

      {flow.step === 3 ? (
        <PracticeQuestionCountStep
          selectedCount={flow.questionCount}
          onSelect={flow.setQuestionCount}
          onBack={() => flow.goToStep(2)}
          onNext={() => flow.goToStep(4)}
        />
      ) : null}

      {flow.step === 4 ? (
        <PracticeRubricStep
          rubric={flow.rubric}
          contextLabel={[flow.domainLabel, flow.level].filter(Boolean).join(', ')}
          isLoading={flow.loadingRubric}
          isSaving={flow.savingRubric}
          isResetting={flow.resettingRubric}
          errorMessage={flow.rubricError}
          onChange={flow.setRubric}
          onReset={() => void flow.resetRubric()}
          onBack={() => flow.goToStep(3)}
          onNext={() => void flow.handleRubricNext()}
        />
      ) : null}

      {flow.step === 5 ? (
        <PracticeConfirmStep
          domain={flow.selectedDomain}
          level={flow.level}
          cvFile={flow.selectedCv}
          questionCount={flow.questionCount}
          rubric={flow.rubric}
          isSubmitting={flow.isSubmitting}
          onBack={() => flow.goToStep(4)}
          onConfirm={() => void flow.handleConfirm()}
        />
      ) : null}

      {flow.isSubmitting ? (
        <div className="sr-only" aria-live="polite">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t('practice.wizard.confirm.submitting')}
        </div>
      ) : null}
    </PracticeWizardShell>
  );
}
