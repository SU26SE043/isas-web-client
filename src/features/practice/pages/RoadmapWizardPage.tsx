import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { RoadmapWizardShell } from '../components/roadmap-wizard/RoadmapWizardShell';
import { RoadmapDomainStep } from '../components/roadmap-wizard/RoadmapDomainStep';
import { RoadmapReportsStep } from '../components/roadmap-wizard/RoadmapReportsStep';
import { RoadmapTargetLevelStep } from '../components/roadmap-wizard/RoadmapTargetLevelStep';
import { RoadmapConfirmStep } from '../components/roadmap-wizard/RoadmapConfirmStep';
import { useRoadmapWizardFlow } from '../hooks/useRoadmapWizardFlow';

export function RoadmapWizardPage() {
  const { t } = useLanguage();
  const flow = useRoadmapWizardFlow();

  return (
    <RoadmapWizardShell
      currentStep={flow.step}
      introTitle={flow.step === 0 ? t('practice.roadmapWizard.createTitle') : undefined}
      introDescription={flow.step === 0 ? t('practice.roadmapWizard.subtitle') : undefined}
    >
      {flow.submitError ? (
        <p className="mb-4 text-sm text-error" role="alert">
          {flow.submitError === 'invalid_input'
            ? t('practice.roadmapWizard.confirm.errorInvalid')
            : flow.submitError === 'forbidden'
              ? t('practice.roadmapWizard.confirm.errorForbidden')
              : flow.submitError === 'cv_not_found'
                ? t('practice.roadmapWizard.confirm.errorCvNotFound')
                : flow.submitError === 'ai_failed'
                  ? t('practice.roadmapWizard.confirm.errorAi')
                  : t('practice.roadmapWizard.confirm.error')}
        </p>
      ) : null}

      {flow.step === 0 ? (
        <RoadmapDomainStep
          domains={flow.domains}
          selectedId={flow.domainId}
          isLoading={flow.loadingDomains}
          onSelect={flow.handleSelectDomain}
          onNext={() => flow.goToStep(1)}
        />
      ) : null}

      {flow.step === 1 ? (
        <RoadmapReportsStep
          reports={flow.allReports}
          selectedIds={flow.selectedIds}
          isLoading={flow.loadingReports}
          onToggle={flow.toggleReport}
          onSelectAll={flow.selectAllReports}
          onUnselectAll={flow.unselectAllReports}
          onBack={() => flow.goToStep(0)}
          onNext={() => flow.goToStep(2)}
        />
      ) : null}

      {flow.step === 2 ? (
        <RoadmapTargetLevelStep
          selectedLevel={flow.targetLevel}
          onSelect={flow.setTargetLevel}
          onBack={() => flow.goToStep(1)}
          onNext={() => flow.goToStep(3)}
        />
      ) : null}

      {flow.step === 3 ? (
        <RoadmapConfirmStep
          domain={flow.selectedDomain}
          targetLevel={flow.targetLevel}
          selectedReports={flow.selectedReports}
          cvId={flow.cvId}
          isSubmitting={flow.isSubmitting}
          onBack={() => flow.goToStep(2)}
          onConfirm={() => void flow.handleCreate()}
        />
      ) : null}

      {flow.isSubmitting ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-surface-base/80 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="rounded-xl border border-subtle bg-surface-raised px-8 py-6 text-center">
            <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm text-foreground">{t('practice.roadmapWizard.generating')}</p>
          </div>
        </div>
      ) : null}
    </RoadmapWizardShell>
  );
}
