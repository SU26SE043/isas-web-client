import React from 'react';
import { FileText } from 'lucide-react';
import { SectionPanel } from '@/components/ui/section-panel';
import { useLanguage } from '@/shared/languages';
import type { InterviewHistoryItem } from '../../types/history.types';
import { RoadmapReportsTable } from './RoadmapReportsTable';
import { RoadmapWizardNav } from './RoadmapWizardNav';

interface RoadmapReportsStepProps {
  reports: InterviewHistoryItem[];
  selectedIds: string[];
  isLoading: boolean;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onUnselectAll: () => void;
  onBack: () => void;
  onNext: () => void;
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
}) => {
  const { t } = useLanguage();

  return (
    <SectionPanel
      icon={<FileText className="size-4" aria-hidden />}
      title={t('practice.roadmapWizard.reports.title')}
      description={t('practice.roadmapWizard.reports.description')}
      isLoading={isLoading}
      footer={<RoadmapWizardNav onBack={onBack} onNext={onNext} />}
    >
      <p className="mb-4 text-caption text-muted-foreground">
        {t('practice.roadmapWizard.reports.futureNote')}
      </p>

      {reports.length === 0 ? (
        <p
          className="rounded-lg border border-subtle bg-surface-overlay px-4 py-6 text-sm text-muted-foreground"
          role="status"
        >
          {t('practice.roadmapWizard.reports.emptyOptional')}
        </p>
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
