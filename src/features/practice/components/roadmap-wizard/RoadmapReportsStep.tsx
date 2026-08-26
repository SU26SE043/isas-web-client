import React from 'react';
import { FileText } from 'lucide-react';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { InterviewHistoryItem } from '../../types/history.types';
import { RoadmapReportsTable } from './RoadmapReportsTable';
import { RoadmapWizardNav } from './RoadmapWizardNav';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { RoadmapWizardStep } from '../../hooks/useRoadmapWizardFlow';

interface RoadmapReportsStepProps {
  reports: InterviewHistoryItem[];
  selectedIds: string[];
  isLoading: boolean;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onUnselectAll: () => void;
  onBack: () => void;
  onNext: () => void;
  goToStep: (step: RoadmapWizardStep) => void;
  selectedDomainId?: string;
  loadError?: boolean;
  reportCounts?: Record<string, number>;
}

export const RoadmapReportsStep: React.FC<RoadmapReportsStepProps> = ({
  reports,
  selectedIds,
  isLoading,
  onToggle,
  onSelectAll,
  onUnselectAll,
  onBack,
  onNext,
  goToStep,
  selectedDomainId = '',
  loadError = false,
  reportCounts = {},
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <SectionPanel
      icon={<FileText className="size-4" aria-hidden />}
      title={t('practice.roadmapWizard.reports.title')}
      description={t('practice.roadmapWizard.reports.description')}
      isLoading={isLoading}
      footer={<div className="space-y-3"><p className="text-sm text-muted-foreground" role="status">{selectedIds.length === 0 ? t('practice.roadmapWizard.reports.selectRequired') : null}</p><RoadmapWizardNav onBack={onBack} onNext={onNext} nextDisabled={selectedIds.length === 0} /></div>}
    >
      <p className="mb-4 text-caption text-muted-foreground">
        {t('practice.roadmapWizard.reports.futureNote')}
      </p>

      {loadError ? (
        <div className="space-y-4 rounded-lg border border-error/40 bg-error/10 px-4 py-5" role="alert">
          <p className="text-sm text-error">{t('practice.roadmapWizard.reports.loadFailed')}</p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" className="btn-primary" onClick={() => navigate('/practice')}>{t('practice.roadmapWizard.reports.practiceCta')}</Button>
            <Button type="button" variant="outline" onClick={() => goToStep('domain')}>{t('practice.roadmapWizard.reports.changeDomainCta')}</Button>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="space-y-4 rounded-lg border border-subtle bg-surface-overlay px-4 py-5">
          <p className="text-sm text-muted-foreground" role="status">{t('practice.roadmapWizard.reports.emptyOptional')}</p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" className="btn-primary" onClick={() => navigate('/practice')}>{t('practice.roadmapWizard.reports.practiceCta')}</Button>
            <Button type="button" variant="outline" onClick={() => goToStep('domain')}>{t('practice.roadmapWizard.reports.changeDomainCta')}</Button>
          </div>
          <p className="text-xs text-muted-foreground">{t('practice.roadmapWizard.reports.countBadge').replace('{count}', String(reportCounts[selectedDomainId] ?? 0))}</p>
        </div>
      ) : (
        <RoadmapReportsTable
          reports={reports}
          selectedIds={selectedIds}
          onToggle={onToggle}
          onSelectAll={onSelectAll}
          onUnselectAll={onUnselectAll}
        />
      )}
    </SectionPanel>
  );
};
