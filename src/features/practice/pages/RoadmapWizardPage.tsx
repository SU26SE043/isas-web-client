import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { RoadmapWizardShell } from '../components/roadmap-wizard/RoadmapWizardShell';
import { RoadmapDomainStep } from '../components/roadmap-wizard/RoadmapDomainStep';
import { RoadmapReportsStep } from '../components/roadmap-wizard/RoadmapReportsStep';
import { RoadmapCvStep } from '../components/roadmap-wizard/RoadmapCvStep';
import { RoadmapCurrentLevelStep } from '../components/roadmap-wizard/RoadmapCurrentLevelStep';
import { RoadmapPriorStep } from '../components/roadmap-wizard/RoadmapPriorStep';
import { RoadmapModeStep } from '../components/roadmap-wizard/RoadmapModeStep';
import { RoadmapTargetLevelStep } from '../components/roadmap-wizard/RoadmapTargetLevelStep';
import { RoadmapConfirmStep } from '../components/roadmap-wizard/RoadmapConfirmStep';
import { useRoadmapWizardFlow } from '../hooks/useRoadmapWizardFlow';

export function RoadmapWizardPage() {
  const { t } = useLanguage();
  const flow = useRoadmapWizardFlow();

  return (
    <RoadmapWizardShell currentStep={Math.max(flow.steps.indexOf(flow.step), 0)} stepKeys={flow.steps.map((step) => `practice.roadmapWizard.steps.${step === 'currentLevel' ? 'currentLevel' : step === 'priorRoadmap' ? 'priorRoadmap' : step}`)}>
      {flow.submitError ? (
        <p className="mb-4 text-sm text-error" role="alert">
          {flow.submitErrorMessage || (flow.submitError === 'invalid_input'
            ? t('practice.roadmapWizard.confirm.errorInvalid')
            : flow.submitError === 'unsupported_level'
              ? t('practice.roadmapWizard.confirm.errorUnsupportedLevel')
            : flow.submitError === 'forbidden'
              ? t('practice.roadmapWizard.confirm.errorForbidden')
              : flow.submitError === 'cv_not_found'
                ? t('practice.roadmapWizard.confirm.errorCvNotFound')
                : flow.submitError === 'ai_failed'
                  ? t('practice.roadmapWizard.confirm.errorAi')
                   : t('practice.roadmapWizard.confirm.error'))}
        </p>
      ) : null}

      {flow.step === 'domain' ? (
        <RoadmapDomainStep
          domains={flow.domains}
          selectedId={flow.domainId}
          isLoading={flow.loadingDomains}
          onSelect={flow.handleSelectDomain}
          onNext={() => flow.goToStep('cv')}
        />
      ) : null}

      {flow.step === 'cv' ? (
        <RoadmapCvStep files={flow.cvFiles} analyses={flow.cvAnalyses} cvId={flow.cvId} analysisId={flow.cvAnalysisId} onCvChange={flow.setCvId} onAnalysisChange={flow.setCvAnalysisId} onBack={() => flow.goToStep('domain')} onNext={() => flow.goToStep('currentLevel')} />
      ) : null}

      {flow.step === 'currentLevel' ? (
        <RoadmapCurrentLevelStep value={flow.currentLevel} source={flow.currentLevelSource} onChange={flow.setCurrentLevel} onBack={() => flow.goToStep('cv')} onNext={() => flow.goToStep('mode')} />
      ) : null}

      {flow.step === 'reports' ? (
        <RoadmapReportsStep
          reports={flow.allReports}
          selectedIds={flow.selectedIds}
          isLoading={flow.loadingReports}
          onToggle={flow.toggleReport}
          onSelectAll={flow.selectAllReports}
          onUnselectAll={flow.unselectAllReports}
          onBack={() => flow.goToStep('targetLevel')}
          onNext={() => flow.goToStep(flow.steps.includes('priorRoadmap') ? 'priorRoadmap' : 'confirm')}
        />
      ) : null}

      {flow.step === 'mode' ? (
        <RoadmapModeStep
          selectedMode={flow.mode}
          selectedSessionCount={flow.selectedIds.length}
          onSelect={flow.setMode}
          onBack={() => flow.goToStep('currentLevel')}
          onNext={() => flow.goToStep('targetLevel')}
          onBackToReports={() => flow.goToStep('reports')}
        />
      ) : null}

      {flow.step === 'targetLevel' ? (
        <RoadmapTargetLevelStep
          selectedLevel={flow.targetLevel}
          onSelect={flow.setTargetLevel}
          onBack={() => flow.goToStep('mode')}
          onNext={() => flow.goToStep(flow.steps.includes('reports') ? 'reports' : flow.steps.includes('priorRoadmap') ? 'priorRoadmap' : 'confirm')}
        />
      ) : null}

      {flow.step === 'priorRoadmap' ? <RoadmapPriorStep roadmaps={flow.completedRoadmaps} value={flow.priorRoadmapId} onChange={flow.setPriorRoadmapId} onBack={() => flow.goToStep(flow.steps.includes('reports') ? 'reports' : 'targetLevel')} onNext={() => flow.goToStep('confirm')} /> : null}

      {flow.step === 'confirm' ? (
        <RoadmapConfirmStep
          domain={flow.selectedDomain}
          targetLevel={flow.targetLevel}
          mode={flow.mode}
          name={flow.name}
          onNameChange={flow.setName}
          selectedReports={flow.selectedReports}
          cvId={flow.cvId}
          cvFiles={flow.cvFiles}
          onCvChange={flow.setCvId}
          cvAnalyses={flow.cvAnalyses}
          cvAnalysisId={flow.cvAnalysisId}
          onCvAnalysisChange={flow.setCvAnalysisId}
          completedRoadmaps={flow.completedRoadmaps}
          priorRoadmapId={flow.priorRoadmapId}
          onPriorRoadmapChange={flow.setPriorRoadmapId}
          focus={flow.focus}
          onFocusChange={flow.setFocus}
          isSubmitting={flow.isSubmitting}
          onBack={() => flow.goToStep(flow.steps.includes('priorRoadmap') ? 'priorRoadmap' : flow.steps.includes('reports') ? 'reports' : 'targetLevel')}
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
