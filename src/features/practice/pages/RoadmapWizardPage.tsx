import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useLanguage } from '@/shared/languages';
import { ROADMAP_WIZARD_STEP_LABEL_KEYS, RoadmapWizardShell } from '../components/roadmap-wizard/RoadmapWizardShell';
import { RoadmapDomainStep } from '../components/roadmap-wizard/RoadmapDomainStep';
import { RoadmapNameFocusStep } from '../components/roadmap-wizard/RoadmapNameFocusStep';
import { RoadmapReportsStep } from '../components/roadmap-wizard/RoadmapReportsStep';
import { RoadmapConfirmStep } from '../components/roadmap-wizard/RoadmapConfirmStep';
import { useRoadmapWizardFlow } from '../hooks/useRoadmapWizardFlow';

export function RoadmapWizardPage() {
  const { t } = useLanguage();
  const flow = useRoadmapWizardFlow();
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (flow.submitError) errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [flow.submitError]);
  const errorKey = flow.submitError ? `practice.roadmapWizard.errors.${flow.submitError}` : '';
  const stepKeys = flow.steps.map((step) => ROADMAP_WIZARD_STEP_LABEL_KEYS[step]);

  return (
    <RoadmapWizardShell currentStep={Math.max(flow.steps.indexOf(flow.step), 0)} stepKeys={stepKeys}>
      {flow.submitError ? <p ref={errorRef} className="mb-4 text-sm text-error" role="alert">{t(errorKey)}</p> : null}
      {flow.step === 'domain' ? <RoadmapDomainStep domains={flow.domains} reportCounts={flow.reportCounts} selectedId={flow.domainId} isLoading={flow.loadingDomains} onSelect={flow.handleSelectDomain} onNext={flow.goNext} /> : null}
      {flow.step === 'nameFocus' ? <RoadmapNameFocusStep name={flow.name} onNameChange={flow.setName} focus={flow.focus} onFocusChange={flow.setFocus} onBack={flow.goBack} onNext={flow.goNext} /> : null}
      {flow.step === 'reports' ? <RoadmapReportsStep reports={flow.allReports} reportCounts={flow.reportCounts} selectedIds={flow.selectedIds} isLoading={flow.loadingReports} loadError={flow.reportsError} onToggle={flow.toggleReport} onSelectAll={flow.selectAllReports} onUnselectAll={flow.unselectAllReports} onBack={flow.goBack} onNext={flow.goNext} goToStep={flow.goToStep} selectedDomainId={flow.domainId} /> : null}
      {flow.step === 'confirm' ? <RoadmapConfirmStep domain={flow.selectedDomain} name={flow.name} selectedReports={flow.selectedReports} scope={flow.scope} onScopeChange={flow.setScope} focus={flow.focus} isSubmitting={flow.isSubmitting} onBack={flow.goBack} onConfirm={() => void flow.handleCreate()} /> : null}
      {flow.isSubmitting ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-base/80 backdrop-blur-sm" role="status" aria-live="polite"><div className="rounded-xl border border-subtle bg-surface-raised px-8 py-6 text-center"><Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" aria-hidden /><p className="mt-3 text-sm text-foreground">{t('practice.roadmapWizard.generating')}</p></div></div> : null}
    </RoadmapWizardShell>
  );
}
