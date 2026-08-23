import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { ROADMAP_WIZARD_STEP_LABEL_KEYS, RoadmapWizardShell } from '../components/roadmap-wizard/RoadmapWizardShell';
import { RoadmapDomainStep } from '../components/roadmap-wizard/RoadmapDomainStep';
import { RoadmapNameFocusStep } from '../components/roadmap-wizard/RoadmapNameFocusStep';
import { RoadmapReportsStep } from '../components/roadmap-wizard/RoadmapReportsStep';
import { RoadmapCvStep } from '../components/roadmap-wizard/RoadmapCvStep';
import { RoadmapCurrentLevelStep } from '../components/roadmap-wizard/RoadmapCurrentLevelStep';
import { RoadmapPriorStep } from '../components/roadmap-wizard/RoadmapPriorStep';
import { RoadmapTargetLevelStep } from '../components/roadmap-wizard/RoadmapTargetLevelStep';
import { RoadmapConfirmStep } from '../components/roadmap-wizard/RoadmapConfirmStep';
import { useRoadmapWizardFlow } from '../hooks/useRoadmapWizardFlow';

export function RoadmapWizardPage() {
  const { t } = useLanguage();
  const flow = useRoadmapWizardFlow();
  const stepKeys = flow.steps.map((step) => ROADMAP_WIZARD_STEP_LABEL_KEYS[step]);

  return (
    <RoadmapWizardShell currentStep={Math.max(flow.steps.indexOf(flow.step), 0)} stepKeys={stepKeys}>
      {flow.submitError ? <p className="mb-4 text-sm text-error" role="alert">{flow.submitErrorMessage || t('practice.roadmapWizard.confirm.error')}</p> : null}
      {flow.step === 'domain' ? <RoadmapDomainStep domains={flow.domains} selectedId={flow.domainId} isLoading={flow.loadingDomains} onSelect={flow.handleSelectDomain} onNext={flow.goNext} /> : null}
      {flow.step === 'nameFocus' ? <RoadmapNameFocusStep name={flow.name} onNameChange={flow.setName} focus={flow.focus} onFocusChange={flow.setFocus} onBack={flow.goBack} onNext={flow.goNext} /> : null}
      {flow.step === 'cv' ? <RoadmapCvStep files={flow.cvFiles} analyses={flow.cvAnalyses} cvId={flow.cvId} analysisId={flow.cvAnalysisId} onCvChange={flow.setCvId} onAnalysisChange={flow.setCvAnalysisId} onBack={flow.goBack} onNext={flow.goNext} /> : null}
      {flow.step === 'currentLevel' ? <RoadmapCurrentLevelStep value={flow.currentLevel} source={flow.currentLevelSource} onChange={flow.setCurrentLevel} onBack={flow.goBack} onNext={flow.goNext} /> : null}
      {flow.step === 'targetLevel' ? <RoadmapTargetLevelStep selectedLevel={flow.targetLevel} onSelect={flow.setTargetLevel} onBack={flow.goBack} onNext={flow.goNext} /> : null}
      {flow.step === 'reports' ? <RoadmapReportsStep reports={flow.allReports} selectedIds={flow.selectedIds} isLoading={flow.loadingReports} onToggle={flow.toggleReport} onSelectAll={flow.selectAllReports} onUnselectAll={flow.unselectAllReports} onBack={flow.goBack} onNext={flow.goNext} /> : null}
      {flow.step === 'priorRoadmap' ? <RoadmapPriorStep roadmaps={flow.completedRoadmaps} isLoading={flow.loadingReports} value={flow.priorRoadmapId} onChange={flow.setPriorRoadmapId} onBack={flow.goBack} onNext={flow.goNext} /> : null}
      {flow.step === 'confirm' ? <RoadmapConfirmStep domain={flow.selectedDomain} targetLevel={flow.targetLevel} currentLevel={flow.currentLevel} name={flow.name} selectedReports={flow.selectedReports} cvId={flow.cvId} cvFiles={flow.cvFiles} scope={flow.scope} onScopeChange={flow.setScope} onCvChange={flow.setCvId} cvAnalyses={flow.cvAnalyses} cvAnalysisId={flow.cvAnalysisId} completedRoadmaps={flow.completedRoadmaps} priorRoadmapId={flow.priorRoadmapId} onEditCvAnalysis={() => flow.goToStep('cv')} onEditPriorRoadmap={flow.hasStep('priorRoadmap') ? () => flow.goToStep('priorRoadmap') : undefined} focus={flow.focus} isSubmitting={flow.isSubmitting} onBack={flow.goBack} onConfirm={() => void flow.handleCreate()} /> : null}
      {flow.isSubmitting ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-base/80 backdrop-blur-sm" role="status" aria-live="polite"><div className="rounded-xl border border-subtle bg-surface-raised px-8 py-6 text-center"><Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" aria-hidden /><p className="mt-3 text-sm text-foreground">{t('practice.roadmapWizard.generating')}</p></div></div> : null}
    </RoadmapWizardShell>
  );
}
