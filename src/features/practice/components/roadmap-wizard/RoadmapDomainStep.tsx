import { CareerPositionSelector } from '@/components/patterns/flow-wizard/CareerPositionSelector';
import { SectionPanel } from '@/components/ui/section-panel';
import type { JobDomainId } from '@/shared/domain/jobDomains';
import { isJobDomainId } from '@/shared/domain/jobDomains';
import { useLanguage } from '@/shared/languages';
import type { PracticeDomain } from '../../types/practiceSetup.types';
import { RoadmapWizardNav } from './RoadmapWizardNav';

interface RoadmapDomainStepProps {
  domains: PracticeDomain[];
  selectedId: string;
  isLoading: boolean;
  onSelect: (domainId: string) => void;
  onNext: () => void;
}

export function RoadmapDomainStep({
  selectedId,
  isLoading,
  onSelect,
  onNext,
}: RoadmapDomainStepProps) {
  const { t } = useLanguage();

  const handleSelect = (domainId: JobDomainId) => {
    onSelect(domainId);
  };

  return (
    <SectionPanel
      title={t('practice.roadmapWizard.domain.title')}
      isLoading={isLoading}
      footer={<RoadmapWizardNav nextDisabled={!selectedId} onNext={onNext} backDisabled />}
    >
      <CareerPositionSelector
        selectedId={isJobDomainId(selectedId) ? selectedId : null}
        onSelect={handleSelect}
        accent="emerald"
        ariaLabel={t('practice.roadmapWizard.domain.groupLabel')}
      />
    </SectionPanel>
  );
}
